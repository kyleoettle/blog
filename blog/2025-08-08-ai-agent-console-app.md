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
Recently, I've been challenging myself whether I'm only using AI where I'm encouraged to use it - like GitHub Copilot - or if we can change our perspective and use it to impact the entire team or organisation.

## The Evolution of the Console App

Almost everyone reading this has probably built a console app - some probably hundreds of console apps :grinning:

I've been thinking about how **Agents could be the next evolution of console apps we build.**

I don't mean using Agents to just search for certain keywords in a log file or build a CSV. Those are perfectly suited to a Console App. I mean in the sense that it should take me minutes or just a few hours to automate a very manual, repetitive, organization-wide task.

## The Agent PR Experiment

I decided to build an AI agent to challenge my thinking: **Could I automate a code review?**  

`"But Kyle, you love doing code reviews, it's part of what you enjoy about your job" - Yes and No!
I love doing a code review to provide valueble feedback, it's also how I get to share my knowledge, but this also takes up a lot of time, and you don't always have time to do a code review when someone wants one.`

The result is [An AI Agent that can perform a code review and leave feedback](https://github.com/kyleoettle/agents), a Multi-Agent workflow that performs comprehensive code reviews on pull requests from GitHub.

In the link I shared, I spent a few short hours spinning up a basic (and I mean really basic) Agent in Python that can perform a code review. But the results were pretty encouraging!

## Building the Agent: With the same freedom as building a console app - fast and furious!

### The Architecture

![child-in-parent](/img/blog-images/ai-agent-console-app/agent-flow.svg)
I tried to keep it simple and organic `//kyle did you just say "organic"? this isn't a tomato` and let the agent evolve to fit my needs, no real pre-planning (just like my console apps)

I know with AI Agents that having multiple agents focus on smaller sub tasks outperforms a single agent trying to do everything.

**⭐ Multi-Agent Review System (async tasks in my console app)**  
I ended up with three different agents so that they could focus on their specific tasks:
- **Style Reviewer**: The one that catches all the indentation and naming stuff that makes me go :unamused: 
- **Security Reviewer**: Uses OWASP Top 10 to spot the scary stuff
- **Summarizer**: Takes all the feedback and makes it actually useful

I figured that this would be good enought to see if I could get valueble feedback from the workflow, but to make this production ready, I would definitely make some improvements to the agents, their instructions and their context.

**⭐ StateGraph (Static Dictionary in my console app)**  
I really enjoyed spending time on thinking about this process, using LangGraph's StateGraph, and how I would use this in a "real world" scenario.  
The interesting part was that just using InMemory state was probably good enough.  
This agent is supposed to execute fast, doesn't require any async execution or human in the loop.  
A pity, I would have loved to throw in CosmosDB to store the state.  

One of the concepts I wanted to test was to see if I could make the reviews more meaningfull by passing in an instruction file from the repository linked to the code review.  
Like mentioned above, I just stored the the state InMemory and as agents completed, I stored their state in the same object to be used by the Summarizer agent.
![child-in-parent](/img/blog-images/ai-agent-console-app/state-flow.svg)


**⭐ Local development & cloud deployment**  
When you build a console app, you run it locally, but the truely special ones might make it to a different environment, so I wanted to test both, and for this scenario it made sense to support cloud deployments - it wouldn't make sense to run an agent locally for code reviews.
- **Local Development**: Ollama with phi4-mini - free and fast for getting started
- **Cloud Deployment**: Azure OpenAI with GPT-4o - to be honest, this was the model that came out of the box with the azd template so why not.

**⭐ Secure~ish Design**  
Security comes out of the box for any cloud platforms and I made use of the basics
- **Azure Key Vault** for secrets
- **Managed Identity** to access Azure resources

Some of the things I didn't do:
- **Api authentication** - Allowing unauthorized users to call your api is 99% of times a very bad idea. It opens up the api to spamming innocent pull requests with code reviews `But Kyle, you can trust strangers on the internet, no?` and in the process leaving you with a huge bill and embarrasment. This being a POC, Authentication wasn't something that I wanted to prove, so I skipped it for now.
- **Prompt injection protection** - and this is where I should probably spend some more time. Due to the design of the agent, it tries to read a "pr_instructions.md" file from the repo it's about to review for custom instructions. My first thought was that this should be okay, considering you're reviewing your own code, you would only be injecting yourself - but security is only as strong as your weakest link and if a malicious user got access to the PR agent, it could probably do some real damage.

### What I learned

What really surprised me while building the agent was how easy it was to get *something* up and running really quickly.  
And this probably isn't specific to Python and LangGraph, it could have been C# and Semantic Kernel, or AWS instead of Azure.  Much like a console app, these tools all feel well supported, easy to use and fit right into your current ecosystem.  
I didn't have to dig deep or search far to get something working, all I had to do was try.  

Some more AI Agent related lessons that I learned:
- **All LLMs aren't created equal** - There are real different in their responses, even with just the default settings, to get real value out of an AI Agent, you probably need to tweak it's settings a bit.
- **Fine tuning your prompts really matter** - I played with a few different prompts and they evolved over time. I wish I saved my first and last prompt (or code reviews) to show the difference. From a complete failure to something providing real value.
- **Your agents can be more specific than you think** - While I was creating this proof of concept I kept on thinking about adding more instructions or context to an agent, and the thoughts quickly turned to "what different agents could I add". I'm lucky that I work with some incredibly smart engineers, and maybe I could try and mimic some of them, instead of a more generic "Security Reviewer" agent.

## What's next for my code review agent.
- **Improving the context with function calling** - When I do a code review I often look at the rest of the file to gain more context. Loading all the files into the prompt from the start seems like a bad idea, but using function calling to load specific files if they require more context might be a great way of allowing the Agents to perform better code reviews.
- **Recreating a team member** - One idea I want to test is recreating one of our engineers by loading all of their previous code reviews into a vector database and exposing it to the Agent. If we want value out of these code reviews, how about "training" it on the best reviewers in the team.
## Final Thoughts

Most organisations have had to migrate from one code repository to another, from GitHub to ADO, from BitBucket to GitHub, from SVN to where ever.  
Most organisations also had to rebuild their build and release pipelines from... you get the picture.

Along with code reviews, these are all very repeatable tasks that follow the same patterns and are ideal of AI Agents.  
If you're challenged with rebuilding 200 pipelines, will it be worth spending 10% of the time creating an Agent and letting it do all the hard work?

I think I proved to some degree that AI Agents can be a valueble tool in the everyday developer playbook.
It takes a bit of time to set up your first agent, the next one is faster, the third one feels like a real console app.  
For organisations that require more governance, I can see setting up a sandbox environment or template with built in auditing and security being a good way to enable the organisations to iterate faster in a safe manner.

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
