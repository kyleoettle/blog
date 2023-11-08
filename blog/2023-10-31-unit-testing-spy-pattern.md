---
slug: test-spy-pattern
title: Unit Testing - Test Spy Pattern
authors: [kyleo]
tags: [c#,unit test]
---

Hi Everyone :wave:

90% of blogs I read start with something about unit testing, so to not dissapoint anyone I'm making my first blog post about unit testing :smile:  

I'm a fan of unit testing code for various reasons, mostly because I've felt the pain when there were none! So I want to chat about a pattern I've been using for the better part of a decade but only found out today that it's called the [Test Spy Pattern.](http://xunitpatterns.com/Test%20Spy.html#:~:text=The%20Test%20Spy%20is%20designed,values%20expected%20by%20the%20test.)


> The Test Spy is designed to act as an observation point by recording the method calls made to it by the SUT as it is exercised. During the result verification phase, the test compares the actual values passed to the Test Spy by the SUT with the values expected by the test.

Okay I don't think my implemntation is exactly the classic Test Spy pattern, but close enough!  
I use functions or actions to verify that method was called correctly and I can easily inspect or set the return value in each test that sets up the function or action.

The reason I use this pattern is because sometimes my framework of choice [FakeItEasy](https://fakeiteasy.github.io/), is not so easy :unamused:
So I create my own implementation of the Interface or Class, which I can use across my project and makes mocking and asserting much easier.

So here are 2 examples where I often end up using the Test Spy Pattern. You can see my demo implementation in [Github](https://github.com/kyleoettle/test-spy-pattern)

- Mocking  HttpClient calls.
- Verifying that a call to the ILogger has been made

## Mocking HttpClient Calls
FakeItEasy can't directly fake an HttpClient, the required methods aren't virtual or abstract so they recommend pretty much the same approach as I'm using, by making use of the HttpMessageHandler but they have to do a bit of [extra work](https://fakeiteasy.github.io/docs/7.4.0/Recipes/faking-http-client/) by calculating the call based on the return type and method name.  

If I'm going to do extra magic, I'm going to do it in a way that's easier for me!  
Here is my implementation of spying the HttpMessageHandler used by the HttpClient and how I can verify calls being made and mock values being returned.

```cs
public class SpyHttpMessageHandler : HttpMessageHandler
{
    internal Func<HttpRequestMessage, HttpResponseMessage> _sendAsync = null;

    protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
    {
        if (_sendAsync == null)
            throw new NotImplementedException(nameof(_sendAsync));
        return Task.FromResult(_sendAsync(request));
    }
}

```
I have a function called _sendAsync which I can use to verify the request being made and I get to mock the HttpResponseMessage. This makes it really easy to mock different response types, and models.

And the way we use it in our unit test:

```csharp
[Fact(DisplayName = "When getting WorldTimeByIP and the correct value is returned")]
public async Task GetWorldTime()
{
    //setup
    var response = new WorldTime() { datetime = DateTime.Now, client_ip = "mockClientIp" };
    var responseMessage = new HttpResponseMessage();
    responseMessage.Content = new StringContent(JsonConvert.SerializeObject(response));
    responseMessage.StatusCode = HttpStatusCode.OK;

    messageHandler._sendAsync = (request) =>
    {
        //assert request properties
        Assert.Equal(HttpMethod.Get, request.Method);
        Assert.Equal("http://worldtimeapi.org/api/ip", request.RequestUri.AbsoluteUri);
        
        //return responseMessage
        return responseMessage;
    };

    //act
    var worldTime = await sut.GetWorldTimeFromIP();

    //assert
    Assert.Equal(response.datetime, worldTime.datetime);
    Assert.Equal(response.client_ip, worldTime.client_ip);
}
```

In this example my DemoClient takes in an HttpClientFactory which I use to create an instance of my HttpClient.  
The HttpClient takes in my SpyHttpMessageHandler which I use for mocking and asserting.  
Some of the benefits here are that it's really easy to assert the Request being made. I can assert the request.Method, I can assert the URL, the headers, the body, etc.  
I also get to specify the HttpResponseMessage just by serializing the model I'd like to return.

## Verifying that a call to the ILogger has been made

The FakeItEasy approach to faking calls to the ILogger isn't pretty and it's hard to verify that you're logging the correct data. The internet is full of examples of how you can do it and all of them is a little bit different.  The reason I went with my Test Spy Pattern is that verifying a log message should be one of the simplist things in the world, and surprisingly it wasn't. So I decided to simplify it for my unit testing.

Here is my implementation of spying the ILogger and how I can verify that the correct calls are being made.

```csharp
public class SpyLogger<T> : ILogger<T>
{
    public IDisposable BeginScope<TState>(TState state)
    {
        return A.Fake<IDisposable>();
    }

    public bool IsEnabled(LogLevel logLevel)
    {
        throw new NotImplementedException();
    }

    internal Action<LogLevel, EventId, object, Exception?> _logInvoked;

    public void Log<TState>(LogLevel logLevel, EventId eventId, TState state, Exception? exception, Func<TState, Exception?, string> formatter)
    {
        if (_logInvoked == null)
            throw new NotImplementedException(nameof(_logInvoked));

        _logInvoked(logLevel, eventId, state, exception);
    }
}
```

I have an action called _logInvoked which I can use to verify that the logger was called correctly. It's easy to verify the LogLevel, the message or exception which are all important to me.  

And the way we use it in our unit test:

```csharp
[Fact(DisplayName = "When getting WorldTimeByIP and a failed status code is returned")]
public async Task GetWorldTime_fail()
{
    //setup
    var response = "mock response";
    var responseMessage = new HttpResponseMessage();
    responseMessage.Content = new StringContent(response);
    responseMessage.StatusCode = HttpStatusCode.Conflict;

    messageHandler._sendAsync = (request) =>
    {
        //assert request properties
        Assert.Equal(HttpMethod.Get, request.Method);
        Assert.Equal("http://worldtimeapi.org/api/ip", request.RequestUri.AbsoluteUri);

        //return responseMessage
        return responseMessage;
    };

    var logged = false;
    logger._logInvoked = (logLevel, eventId, state, exception) =>
    {
        logged = true;
        Assert.Equal($"Failed to get WorldTime from IP. {responseMessage.StatusCode}: {response}", state.ToString());
    };

    //act
    var worldTime = await sut.GetWorldTimeFromIP();

    //assert
    Assert.Null(worldTime);
    Assert.True(logged);
}
```

In this implementation I set the _logInvoked action that will be called in my SpyLogger.  
I get to look at and assert the actual values being passed to my spy logger and I find it easier to verify the values compared to other frameworks due to the simplistic nature of the Spy Test Pattern.
