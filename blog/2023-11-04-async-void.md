---
slug: async-void
title: async (a)void
authors: [kyleo]
tags: [c#,.net, api, async]
---

Hi Everyone :wave:

A while ago we had the unfortunate event of breaking prod :suprised:  
We made some small changes, all tests passed, everything was good and the world slept peacefully that night, until we saw the service started going down seamingly at random! Turns out it wasn't random at all, it was a pesky async void which we missed changing to an async task and it caused the entire service to come crumbling down.

Most of us know that when you want to change a method from sync to async, you change the calls to an async Task, it's pretty simple and straight forwared, but we forgot to change one of the signatures from `void DoSomething()` to `async Task DoSomething()` and left it as `async void DoSomething()`

"But Kyle, surely you have some global exception handling in your code?" - Yes we did and no it didn't help!  
The problem is in the way that Tasks and voids propogate their exceptions.  
When an exception is thrown in an async Task, you can await the Task and the exception is captured in the Task's context, even if you don't await the task and it's "fire and forget", the exception is still captured in an anonymous Task's context.  
With async void, there is no return type, it's always "fire and forget" and there is no place to capture the exception.  
In short it causes an [exception in the ThreadPool which causes the application to crash](https://learn.microsoft.com/en-us/dotnet/standard/threading/exceptions-in-managed-threads?redirectedfrom=MSDN)

Let's look at an example in my [github repo](https://github.com/kyleoettle/async-void-example)


### Awaiting async Task - Caught in middleware


### Fire-and-forget async Task - Caught in TaskScheduler.UnobservedTaskException


### Fire-and-forget async void - Raised in AppDomain.UnhandledException and crashes

