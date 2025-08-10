---
slug: ai-agent-console-app
title: The Evolution of Console Apps - How AI Agents Could Transform Software Engineering
authors: [kyleo]
tags: [AI, Agents, LangGraph, Python, Code Review, DevOps, Azure, azd]
---

Hi Everyone :wave:

I built something cool! [AI Agents repository](https://github.com/kyleoettle/agents) - an AI agent that performs automated code reviews.

Like everyone, I've been playing with AI Agents for a while now. I'm lucky enough that Investec allows, and encourages, us to adopt AI and use it to our advantage. But I've always thought there should be more to it. I wanted to see the 10x it promised.
<!-- truncate -->
Recently, I've been challenging myself whether we're I'm only using AI where I'm encouraged to use it - like GitHub Copilot - or if we can change our perspective and use it to impact the entire team or organisation.


## The Evolution of the Console App

Almost everyone reading this has probably built a console app - some probably hundreds of console apps :grinning:

Recently, I've been thinking about how **Agents could be the next evolution of console apps we build.**

I don't mean using Agents to just search for certain keywords in a log file or build a CSV. Those are perfectly suited to a Console App. I mean in the sense that it should take me minutes or just a few hours to automate a very manual, repetitive, organization-wide task.

## The Agent PR Experiment

I decided to build an AI agent to challenge my thinking: **Could I automate a code review?**  

`"But Kyle, you love doing code reviews, it's part of what you enjoy about your job" - Yes and No!
I love doing a code review to provide valueble feedback, it's also how I get to share my knowledge, but this also takes up a lot of time, and you don't always have time to do a code review when someone wants one.`

The result is [An AI Agent that can perform a code review and leave feedback](https://github.com/kyleoettle/agents), a Multi-Agent workflow that performs comprehensive code reviews on pull requests from GitHub.

In the link I shared, I spent a few short hours spinning up a basic (and I mean really basic) Agent in Python that can perform a code review. But the results were pretty encouraging!

## Building the Agent: With the same freedom when building a console app - fast and furious!

### The Architecture

![child-in-parent](/img/blog-images/ai-agent-console-app/agent-flow.svg)
I tried to keep it simple and organic `//kyle did you just say "organic"? this isn't a tomato.` and let the agent evolve to fit my needs, no real pre-planning (just like my console apps)

I know with AI Agents that having multiple agents focus on smaller sub tasks typically outperforms a single agent trying to do everything.

**⭐ Multi-Agent Review System (async tasks in my console app)**  
I ended up with three different agents so that they could focus on their specific tasks:
- **Style Reviewer**: The one that catches all the indentation and naming stuff that makes me go :unamused: 
- **Security Reviewer**: Uses OWASP Top 10 to spot the scary stuff
- **Summarizer**: Takes all the feedback and makes it actually useful

I figured that this would be good enought to see if I could get valueble feedback from the workflow, but to make this production ready, I would definitely make some improvements to the agents, their instructions and their context.

**⭐ LangGraph Orchestration (Task.AwaitAll() in my console app)**  
I really enjoyed spending time on thinking about this process, using LangGraph's StateGraph, and how I would use this in a "real world" scenario.
The uninteresting part was that just using InMemory state was probably good enough. This agent is supposed to execute fast, doesn't require any async execution or human in the loop. A pity, I would have loved to throw in CosmosDB to store the state.
Todo: Add some more content here.

**⭐ Local Development**
In your everyday development lifecycle you do most of your work locally - I wanted to make sure I could replicate that as closely as possible, while also having the option of playing with different llm models. I decided to go with the phi4-mini model running on Ollam. this model is free, fast and worked great for the simple requirements of my agent. 

**Security-First~ish Design**
We all know how important security is, and we all know how easy security is these days. Security should be a first class citizen in any code you write. I used the baked in tools like Azure KeyVault and a Managed Identity.  
I decided to not add role based access control to my api because I wasn't sure in what capacity an agent like this should be hosted, so I left the decision for when I need to make it.  
if it's hosted within your organisation in Azure, Entra ID with RBAC makes 100% sense.  
If you want to expose it as a SaaS, you might want to consider something else.  
For demo purposes, I just left it out.

When it came to prompt injection, this is where I need to improve the agent.
I decided to improve the context, and in so the quality of the review, as mentioned earlier I load a "pr_instructions.md" file from the repository the agent is reviewing.
I considered adding a step to review the instruction file, but considering the use case is that you call the agent to review your own code, so you would only be injecting yourself? If this agent was a SaaS style service, then 100% add a step to review the instructions file.

### How I Actually Built It

Here's the thing that surprised me - building an AI agent isn't like building a normal app. I had to completely change how I approach development.

I ended up creating this super structured workflow that breaks everything into three phases:

1. **Requirements Gathering** - What exactly am I trying to solve here?
2. **Prompt Engineering** - How do I explain to the AI what I want without confusing it?
3. **Implementation Planning** - How do I actually make this thing work reliably?

Honestly, the prompt engineering part was way harder than I thought it would be. You can't just say "review this code" and expect magic. You have to be really specific about what you want, how you want it formatted, what to focus on... it's like training a very smart but very literal intern :laughing:

## The Real Impact: This is where it gets exciting!

So here's the question that's been bugging me: How much time could your organization save if 90% of the code review issues were caught before a human even looked at it?

I mean, think about all the repetitive stuff we do as engineers:
- Migrating repositories between source control providers (ugh, done this too many times)
- Rotating service account credentials (necessary evil)
- Rebuilding pipelines when we move platforms
- Analyzing logs for hours only to find out it was just a configuration issue :facepalm:

This is exactly why I'm so excited about AI Agents. It's not about making **me** 10x more productive - it's about **unblocking everyone else** and getting rid of the boring, repetitive stuff that drains our energy.

## Want to Try It?

The best part? You can actually play with this right now!

If you want to mess around with it, the repo is deployable to Azure. Just run `azd up` and you're good to go. Or if you want to keep it local, fire up Ollama and you can run it on your machine.

**Just a heads up though** - it's 100% susceptible to prompt injection and has zero authorization :sweat_smile: This is very much a "proof of concept" situation, not something you'd want to put in production without some serious security work!

But that's the beauty of this approach - you don't need some massive ML team or months of training data. You can literally spin this up in a couple of hours and start experimenting. That's the kind of accessibility that gets me excited about where this is all heading.

## What's Next? (Because I can't help myself)

I'm already thinking about what other console apps I can turn into agents:

- **Repository Migration Agents**: Imagine just telling an agent "move this repo from GitHub to Azure DevOps" and it handles everything - pipelines, permissions, branch policies, the works!
- **Pipeline Rebuilding Agents**: "Hey, recreate this Jenkins pipeline in GitHub Actions but with modern best practices" - done!
- **Log Analysis Agents**: No more grep-ing through thousands of lines. Just ask "why is the API slow?" and get actual insights
- **Credential Rotation Agents**: Zero-downtime security updates that actually work :pray:

Honestly, the possibilities are kind of endless, and that's what has me so pumped about this space.

## The Bigger Picture (Getting a bit philosophical here)

Here's what I think is happening: We're at this inflection point where all those mundane, repetitive tasks that eat up our time could just... disappear.

The question isn't really **whether** AI agents will change how we work - it's how quickly we can adapt and start building them.

I keep coming back to this: What if instead of spending our weekends writing yet another console app to solve some organizational problem, we could just describe what we want and have an agent figure out the implementation?

What console app are you going to replace with an agent? :thinking_face:

---

*Want to dive deeper? Check out the [AI Agents repository](https://github.com/kyleoettle/agents) and let me know what you build! I'd love to hear about your experiments.*
