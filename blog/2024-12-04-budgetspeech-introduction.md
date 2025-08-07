---
slug: budgetspeech-introduction
title: BudgetSpeech - I made something!
authors: [kyleo]
tags: [Programmable Banking, Open Banking, BudgetSpeech, Investec]
---

Hi Everyone :wave:

I made something cool! [budgetspeech](https://budgetspeech.cloud)

I love personal finance, sometimes it can be hard, sometimes it can be stressful, but it's something all of us have to deal with in some capacity.

My wife and I have a bi-weekly meeting called :star: <b>Budget Speech </b> :star: - Where either of us get to be the Minister of Finance for the evening and, you know, give the Budget Speech :satisfied:

We have a big Excel document with all our budgets for different expenses and we track it throughout the month. This workes pretty great and we can be really specific about which expenses gets allocated against which category. This way we're always on the same page whether we're getting McDonalds on Friday, or if we should rather stick to the leftovers in the fridge.

Here is a small snippit of what the excel document used to look like
![child-in-parent](/img/blog-images/budgetspeech-introduction/budgetspeech-excel.png)

There are a few issues though...

- You have to download your bank statements manually. We share a single bank account for expenses and only one of us can receive the In App Authentication request to log in. So only one of us has access to the statements.
- You can't download the statements from the Investec Mobile App, so you need to use a laptop.
- Every now and then we create a copy of the Excel document or save it in a different location. You would think two ~~smart~~ people could keep track of a single document on a shared drive...
- It's still a very manual process you need to dedicate time for.
- It's hard to keep track of your historical trends and you need to flip through Excel sheets
- I am a fan of [Vault22](https://www.vault22.io/) (formerly 22Seven) but it never really did what I wanted. When you go to Checkers you might buy food for yourself and dog food. They aren't both "groceries". One is "pets"
- It's boring and I love coding.

This is where [budgetspeech](https://budgetspeech.cloud) comes in.

I bank with [Investec](https://www.investec.com/) and they support [Open Banking](https://www.investec.com/en_gb/welcome-to-investec/digital/open-banking.html), and in South Africa they have a similar set of api's based on the same standard called [Programmable Banking](https://www.investec.com/en_za/banking/tech-professionals/programmable-banking.html)

I decided to have fun, over engineer and play around while automating my Excel version of BudgetSpeech.  
Read along the next couple of episodes as I discuss what and how I built [budgetspeech](https://budgetspeech.cloud).

In the video below I used [Investec's sandbox environment and credentials](https://developer.investec.com/za/api-products/documentation/SA_PB_Account_Information#section/Authentication). You're welcome to play around with it or just create a `Mock Account` - no bank account required :wink:

<video width="640" height="480" controls autoplay>
    <source src="/img/blog-images/budgetspeech-introduction/budgetspeech-create-account.mp4" type="video/mp4"/>
</video>
