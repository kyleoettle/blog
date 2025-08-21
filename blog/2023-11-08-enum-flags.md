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

<!-- truncate -->

Here is the code in my [Github repo](https://github.com/kyleoettle/example-enum-flags) that you can check out.

Lets create an enum to store a list of client preferences.

```csharp
[Flags]
public enum ClientPreferences
{
    None = 0,
    DarkMode = 1,
    LargeText = 2,
    AutoComplete = 4,
    AIAssist = 8,
    AutoOrder = 16
}
```

Things to note is that I added the `[Flags]` attribute to the enum, and I set the values to powers of 2 and a default `None = 0` enum.
This way I can combine the enum values to create a single value that represents a combination of preferences.

Lets create a variable containing some of our preferences and print them out.

```csharp
var preferences = ClientPreferences.LargeText | ClientPreferences.AutoComplete | ClientPreferences.AutoOrder;
Console.WriteLine($"Preferences String value: {preferences}");
Console.WriteLine($"Preferences Integer value: {(int)preferences}");
```

Because we selected LargeText, AutoComplete and AutoOrder, the output will be:

```csharp
// Preferences String value: LargeText, AutoComplete, AutoOrder
// Preferences Integer value: 22
```

The Integer value is 22 because we added the values of the selected preferences together. This is great because there is no other combination of preferences that will add up to 14!

Using the HasFlag Function, we can check if a preference is selected in a combination of preferences.  
Lets print out our preferences to see the HasFlag values.

```csharp
Console.WriteLine($"Preferences HasFlag:None: {preferences.HasFlag(ClientPreferences.None)}");
Console.WriteLine($"Preferences HasFlag:DarkMode: {preferences.HasFlag(ClientPreferences.DarkMode)}");
Console.WriteLine($"Preferences HasFlag:LargeText: {preferences.HasFlag(ClientPreferences.LargeText)}");
Console.WriteLine($"Preferences HasFlag:AutoComplete: {preferences.HasFlag(ClientPreferences.AutoComplete)}");
Console.WriteLine($"Preferences HasFlag:AIAssist: {preferences.HasFlag(ClientPreferences.AIAssist)}");
Console.WriteLine($"Preferences HasFlag:AutoOrder: {preferences.HasFlag(ClientPreferences.AutoOrder)}");
```

The output will be:

```csharp
// Preferences HasFlag:None: True
// Preferences HasFlag:DarkMode: False
// Preferences HasFlag:LargeText: True
// Preferences HasFlag:AutoComplete: True
// Preferences HasFlag:AIAssist: False
// Preferences HasFlag:AutoOrder: True
```
> You'll notice the None enum value is also printed out. This is because the None enum value is 0, and 0 is included in all combinations of preferences. If you don't want a None enum option, you can ommit it and start your index at 1.

`"But Kyle, I want to get an array of preferences, not a single value! Please Help!"`  

You can still get an array of enum values if you want to.

```csharp
var selectedPreferences =
    System.Enum.GetValues(typeof(ClientPreferences))
    .Cast<ClientPreferences>()
    .Where(p => preferences.HasFlag(p));
```

And printing out the array, the output will be:

```csharp
// Preferences in Array: None
// Preferences in Array: LargeText
// Preferences in Array: AutoComplete
// Preferences in Array: AutoOrder
```


