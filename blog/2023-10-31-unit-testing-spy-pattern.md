---
slug: test-spy-pattern
title: Unit Testing - Test Spy Pattern
authors: [kyleo]
tags: [c#,unit test]
---

Hi Everyone :wave:

90% of blogs start with something about unit testing, so to not dissapoint anyone I'm making my first blog post about unit testing :)  

I'm a fan of unit testing code for various reasons, mostly because I've felt the pain when there were none! So I want to chat about a pattern I've been using for the better part of a decade but only found out today that it's called the [Test Spy Pattern](http://xunitpatterns.com/Test%20Spy.html#:~:text=The%20Test%20Spy%20is%20designed,values%20expected%20by%20the%20test.)


> The Test Spy is designed to act as an observation point by recording the method calls made to it by the SUT as it is exercised. During the result verification phase, the test compares the actual values passed to the Test Spy by the SUT with the values expected by the test.

Okay I don't think my implemntation is exactly the classic Test Spy pattern, but close enough!  
I use functions or actions to verify that method was called correctly and it's the responsiblity of each test to do the setup of the function.

The reason I use this pattern is because sometimes my framework of chose [FakeItEasy](https://fakeiteasy.github.io/), is not so easy :D
So I create my own implementation of the interface.

So here are 2 examples where I often end up using the Test Spy Pattern.

- Verifying that a call to the ILogger has been made
- Mocking  HttpClient calls.

Here is my implementation of the ILogger

```
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
I have an action called _logInvoked which will I can use to verify that the logger was called correclty and will conveniently throw an exception if I forgot to set it.

And the way you use it in your unit test


```
[Fact(DisplayName = "Calling Run and an Error is throw")]
public async Task Run()
{
    //setup
    var mockError = "mockError";
    var statusCode = System.Net.HttpStatusCode.Forbidden;
    var logged = false;
    var logger = new SpyLogger<DemoService>();
    var sut = new DemoService(logger);

    logger._logInvoked = (logLevel, eventId, state, exception) =>
    {
        logged = true;
        Assert.Contains($"Error: {mockError}, Code: '{statusCode}'", state.ToString());
    };

    //act
    var ex = await Assert.ThrowsAsync<Exception>(() => sut.Run());

    //assert
    Assert.Equal(mockError, ex.Message);
    Assert.True(logged);
}
```

In this implementation I set the _logInvoked action that will be called in my SpyLogger.  
I get to look at and assert the actual values being passed to my spy and I find it easier to verify the values compared ot other frameworks.


Here is my implementation of the HttpClient, or more specifically the HttpMessageHandler used by the HpptClient and how I can verify calls being made and mock calls coming back.

```
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
I have a function called _sendAsync which I can use to verify the request being made and I get to mock the HttpResponseMessage. This makes it really easy to mock different response types and models

And the way you use it in your unit test




```

[Fact(DisplayName = "Calling GetToken")]
public async Task Calling_GetToken()
{
    var responseToken = new Token("mockAccessToken", 10, "mockTokenType");
    var response = new HttpResponseMessage();
    response.Content = new StringContent(JsonConvert.SerializeObject(responseToken));
    response.StatusCode = System.Net.HttpStatusCode.OK;

    var messageHandler = new SpyHttpMessageHandler();
    messageHandler._sendAsync = () => response;
    var httpClient = new HttpClient(messageHandler);
    A.CallTo(() => httpClientFactory.CreateClient("TbsTokenClient"))
        .Returns(httpClient);

    var token = await sut.GetToken();
    Assert.Equal(responseToken.AccessToken, token.AccessToken);
    Assert.Equal(responseToken.TokenType, token.TokenType);
    Assert.Equal(responseToken.ExpiresIn, token.ExpiresIn);
}

``