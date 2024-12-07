---
slug: async-void
title: Async (a)void
authors: [kyleo]
tags: [c#,.net, api, async]
---

Hi Everyone :wave:

A while ago we had the unfortunate event of breaking prod :open_mouth:  
We made some small changes to our .net api, all tests passed, everything was good and the world slept peacefully that night, until we saw the service started going down seemingly at random! Turns out it wasn't random at all, it was a pesky async void which we missed changing to an async Task and it caused the entire service to come crumbling down.

Most of us know that when you want to change a method from sync to async, you change the calls to an async Task, it's pretty simple and straight forward, but we forgot to change one of the signatures from `void DoSomething()` to `async Task DoSomething()` and left it as `async void DoSomething()`

"But Kyle, surely in an api the controller will just rethrow the error, right?" - Yes and no!  
The problem is in the way that Tasks and voids propagate their exceptions, and the way we didn't await our call.    
When an exception is thrown in an async Task, you can await the Task and the exception is captured in the Task's context, even if you don't await the task and it's "fire and forget", the exception is still captured in an anonymous Task's context.  
With async void, there is no return type, it's always "fire and forget" and there is no place to capture the exception.  
In short it causes an [exception in the ThreadPool which causes the application to crash](https://learn.microsoft.com/en-us/dotnet/standard/threading/exceptions-in-managed-threads?redirectedfrom=MSDN)

Let's look at some examples in my [github repo](https://github.com/kyleoettle/async-void-example) to explain some behaviour.  

I have a controller with 3 methods to demonstrate the different scenarios

```csharp
[Route("[controller]/[action]")]
[ApiController]
public class DemoController : ControllerBase
{
    private readonly IDemoService demoService;
    private static readonly string[] demoValues = new[]
    {
        "A", "B", "C"
    };

    public DemoController(IDemoService demoService)
    {
        this.demoService = demoService;
    }

    [HttpGet(Name = "GetTask")]
    public async Task<IEnumerable<string>> GetTask()
    {
        // fire and forget
        // no await so exception will be caught in TaskScheduler.UnobservedTaskException
        // demoValues will be returned
        demoService.PerformTaskAsync();
        return demoValues;
    }

    [HttpGet(Name = "GetTaskAsync")]
    public async Task<IEnumerable<string>> GetAsyncTask()
    {
        // awaits demoService.PerformTaskAsync
        // exception will be thrown and handled in ExceptionMiddleware
        // demoValues will not be returned
        await demoService.PerformTaskAsync();
        return demoValues;
    }

    [HttpGet(Name = "GetVoidAsync")]
    public async Task<IEnumerable<string>> GetAsyncVoid()
    {
        // fire and forget
        // no await so exception will be logged in AppDomain.CurrentDomain.UnhandledException and crash
        // demoValues will be returned
        demoService.PerformVoidAsync();
        return demoValues;
    }
}
```

I have custom middleware to handle exceptions and do some fancy stuff

```csharp
public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionMiddleware> _logger;

    public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext httpContext)
    {
        try
        {
            await _next(httpContext);
        }
        catch (Exception exception)
        {
            // log the error
            _logger.LogError(exception, "error during executing {Context}", httpContext.Request.Path.Value);
            
            var response = httpContext.Response;
            response.ContentType = "application/json";

            //do some fancy error handling
            response.StatusCode = (int)HttpStatusCode.InternalServerError;
            var message = System.Text.Json.JsonSerializer.Serialize($"Whoops, something went wrong! -  {exception.Message}");
            await response.WriteAsync(message);
        }
    }
}
```

I have some extra event handlers to demonstrate the fire and forget exception behaviour

```csharp
TaskScheduler.UnobservedTaskException += (sender, e) =>
{
    Console.WriteLine($"*** UnhandledException in TaskScheduler! - {e.Exception}");
};

AppDomain.CurrentDomain.UnhandledException += (sender, e) =>
{
    Console.WriteLine($"*** UnhandledException in AppDomain! - {e.ExceptionObject}");
};
```

And I have a demo service that will throw some errors in async calls

```csharp
public class DemoService : IDemoService
{
    public async Task PerformTaskAsync()
    {
        await Task.Delay(1000);
        throw new NotImplementedException(nameof(PerformTaskAsync));
    }

    public async void PerformVoidAsync()
    {
        await Task.Delay(1000);
        throw new NotImplementedException(nameof(PerformVoidAsync));
    }
}
```


### Awaiting async Task - Caught in middleware

When you await a Task and an exception is thrown, the exception will be stored on the Task's context and the calling code will know how to handle it.

```csharp
[HttpGet(Name = "GetTaskAsync")]
public async Task<IEnumerable<string>> GetAsyncTask()
{
    // awaits demoService.PerformTaskAsync
    // exception will be thrown and handled in ExceptionMiddleware
    // demoValues will not be returned
    await demoService.PerformTaskAsync();
    return demoValues;
}
```

In this case of calling the `GetTaskAsync` endpoint the middleware caught the error and you can see the custom error message `"Whoops, something went wrong!"` in the result.  
This is great and I guess in 99% of cases what you want.

![child-in-parent](/img/blog-images/async-void/async-await-task.png)

### Fire-and-forget async Task - Caught in TaskScheduler.UnobservedTaskException

When you don't await a Task and an exception is thrown, the exception is handled by the [TaskScheduler.UnobservedTaskException](https://learn.microsoft.com/en-us/dotnet/api/system.threading.tasks.taskscheduler.unobservedtaskexception) 

>This event provides a mechanism to prevent exception escalation policy (which, by default, terminates the process) from triggering.

This is great, so out of the box if a Task throws an exception and we didn't await it, it won't crash our process and we have the ability to log or react on it! One thing to remember is that the Task has to be collected by the Garbage Collector before the event is raised.  

```csharp
[HttpGet(Name = "GetTask")]
public async Task<IEnumerable<string>> GetTask()
{
    // fire and forget
    // no await so exception will be caught in TaskScheduler.UnobservedTaskException
    // demoValues will be returned
    demoService.PerformTaskAsync();
    return demoValues;
}
```

When calling the `GetTask` endpoint, the demoValues get returned by the controller as expected.

![child-in-parent](/img/blog-images/async-void/async-task.png)

But in the console output we could see the log from the TaskScheduler.UnobservedTaskException handler.  
Without the UnobservedTaskException handler we would never have known about the exception in the Task.

![child-in-parent](/img/blog-images/async-void/async-task-error.png)


### Fire-and-forget async void - Raised in AppDomain.UnhandledException and crashes

Now to the problem we had...

```csharp
[HttpGet(Name = "GetVoidAsync")]
public async Task<IEnumerable<string>> GetAsyncVoid()
{
    // fire and forget
    // no await so exception will be logged in AppDomain.CurrentDomain.UnhandledException and crash
    // demoValues will be returned
    demoService.PerformVoidAsync();
    return demoValues;
}
```
When making a call to the `GetAsyncVoid` endpoint it returns the demoValues correctly which is great.  

![child-in-parent](/img/blog-images/async-void/async-void.png)

The `demoService.PerformVoidAsync` was an async void and as explained above, when an exception was thrown, there was nowhere for the exception to go, so it went to hell and took the service with it!  

In the AppDomain.UnhandledException handler in my demo I was able to log the exception, but by this time it's too late and the service will inevitably crash.  

Here you can see the output from the console window and the exception I logged, along with process exiting at the end.

![child-in-parent](/img/blog-images/async-void/async-void-error.png)


### Key take aways
- Never use async void - use async Task.
- If you want to fire and forget a Task, use TaskScheduler.UnobservedTaskException handler so that you can monitor unhandled exceptions in your Tasks.
- Never use async void.
- Never use async void.