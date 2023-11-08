---
slug: enum-flags
title: Fun with (Enum) Flags
authors: [kyleo]
tags: [c#,.net, Enum, FlagsAttribute]
---

Hi Everyone :wave:

One of the lesser known but my favorite features of Enums are [Flags](https://learn.microsoft.com/en-us/dotnet/api/system.flagsattribute?view=net-7.0)

Enums are usually used to indicate a single option, like a day of the week, your favorite colour, pizza size... We all get it, we've all used it, but how often have you seen an array of Enums being passed around in your code?  
There was probably a good reason for it if you have. Maybe an array of features, an array of preferred contact methods, supported payment methods?  This is what's really cool about Flags, You can capture a selection of enums in a single value :satisfied:

Here is some code in my [Github repo](https://github.com/kyleoettle/example-enum-flags) that you can check out.

Lets create an Enum to store a list of client preferences

```csharp
[Flags]
public Enum ClientPreferences
{
    DarkMode = 0,
    LargeText = 1,
    AutoComplete = 2,
    AIAssist = 4,
    AutoOrder = 8
}
```
