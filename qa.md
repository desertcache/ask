# Ask about my work: the answer bank

Every answer the box can show is in this file, and nothing else is. Sam reviewed and approved each one.
Facts come only from Sam's public pages: the portfolio at https://desertcache.github.io/portfolio/, its
two work samples, and the public CV.

Each entry: **Asks like** = sample phrasings the model matches a question against (the first one is
also the entry's chip label). **Answer** = the lead the visitor sees first. **Detail** = what follows
as prose, one line per paragraph, or **Highlights** = a list, only where the content is one. **Next** = the two follow-up questions offered after it. **Link** = where the
answer points on the portfolio. Edit this file, then run `npm run build` to regenerate data/bank.json.

---

## A. Who Sam is

### 1. who-is-sam
**Asks like:** Who is Sam? · Who is this? · Tell me about him · What does Sam do? · Give me the short version · Who is Sam Bates? · Introduce Sam · Summarize Sam in a sentence · What's Sam's story? · Overview of Sam
**Answer:** Sam Bates is an AI Solutions Manager at DoorDash, based in Phoenix. He builds production AI for operations teams, leads the people who run it, and teaches organizations to adopt it.
**Detail:**
He built an AI support copilot that an outsourced support team now works live cases in, and he has trained 800+ people to put AI to work, counting adoption rather than attendance. He merged 200+ pull requests in 2026, every one of them built with AI coding agents.
Before tech, he came up through operations and emergency medicine, where he led a 12-person crisis-response team as a volunteer EMT.
**Next:** career-path, copilot
**Link:** #top

### 2. current-role
**Asks like:** What's his job? · What's his title? · What does he do at DoorDash now? · What is an AI Solutions Manager? · What's his role right now? · Current job · Where does he work? · What company is he at? · Job title
**Answer:** He's an AI Solutions Manager in DoorDash Merchant Ops, promoted in September 2026 to lead AI solutions for merchant-integration support.
**Detail:**
He owns the AI support workspace's roadmap and access model, and he coaches the outsourced support team working live cases inside it. On top of his own build work, he's the consultative partner and primary PR approver for 5 builders.
**Next:** copilot, leadership
**Link:** #about

### 3. location
**Asks like:** Where is he based? · Where does he live? · What time zone is he in? · Is he in Arizona? · Where's he located? · Which state? · Phoenix? · Home base
**Answer:** Phoenix, Arizona. That's UTC−7 all year, since Arizona skips daylight saving.
**Next:** remote, contact
**Link:** #contact

### 4. career-path
**Asks like:** What's his background? · How did he get into tech? · What did he do before DoorDash? · Walk me through his career · Is he self-taught? · How did he get here? · Career journey · Non-traditional background · From medicine to tech · Previous jobs
**Answer:** From the ER to production code in eleven years. Every role he held ran the operations the next one automated.
**Highlights:**
- 2015: emergency medical scribe on the pre-med track, and volunteer EMT with the Phoenix Fire Department.
- 2019: lead patient care coordinator at AZ Pain Doctors, where he hired and trained 16 coordinators.
- 2022 to 2025: DoorDash merchant services, then executive escalations, then technical integrations, where he wrote his first production code.
- September 2026: promoted to AI Solutions Manager.
**Next:** emt, doordash-history
**Link:** #about

### 5. emt
**Asks like:** Was he an EMT? · Tell me about the fire department · What's the crisis team? · Medical background? · Firefighter? · Emergency medicine background · Healthcare experience · Paramedic · First responder · Scribe
**Answer:** Yes. He was a volunteer EMT and Behavioral Health Team Lead with the Phoenix Fire Department.
**Detail:**
He led a 12-person crisis-response team, coordinating fire, medical and law-enforcement units on scene. Before that he was a master emergency medical scribe across four Banner Health emergency departments, including the Level I trauma centers at Banner Desert, where he also interviewed, hired and trained the new scribes.
**Next:** career-path, pressure
**Link:** #about

### 6. education
**Asks like:** Where did he go to school? · Does he have a degree? · What did he study? · Education? · Certifications? · College? · University · Schooling · Did he go to college? · Biology
**Answer:** Coursework toward a B.S. in Cell & Molecular Biology at Western New Mexico University, and an NREMT-B (EMT) certification from Estrella Mountain Community College.
**Detail:**
He moved into engineering on the job at DoorDash, writing his first production code in 2025.
**Next:** career-path, can-he-code
**Link:** #about

### 7. doordash-history
**Asks like:** How long has he been at DoorDash? · What roles has he had at DoorDash? · Has he been promoted? · DoorDash timeline · Years at DoorDash · Earlier DoorDash jobs · Tenure
**Answer:** He joined DoorDash in 2022 and has been promoted three times in four years.
**Highlights:**
- Merchant Services Senior Specialist: onboarded 9,000+ stores and wrote the SOPs that expanded POS provider coverage.
- Disaster Prevention Specialist: one of a small team on executive-level escalations, 50+ cases a day.
- Technical Integrations Associate: wrote his first production code and built the AI copilot.
- Promoted to AI Solutions Manager in September 2026.
**Next:** current-role, awards
**Link:** #about

### 8. hobbies
**Asks like:** What does he do for fun? · Hobbies? · What's he like outside work? · Interests · Free time · Rock climbing · Hiking · Personal interests
**Answer:** Rock climbing, hiking, plants, and building AI tools.
**Detail:**
His side projects live on this site: a walkable starship, a dot-for-dot Pac-Man arcade, and a congressional-trading digest. Even his skincare regimen is run like an ops program.
**Next:** side-projects, starship
**Link:** #lab

## B. Technical depth

### 9. can-he-code
**Asks like:** Can he code? · Is he technical? · Does he write code himself? · Is he hands-on? · Does he actually build things? · Is he a programmer? · Software development skills · Does he write production code? · Coding ability · Developer?
**Answer:** Yes. He writes production code: full-stack TypeScript apps, an AI copilot, and production Go in DoorDash's backend monorepo.
**Detail:**
He merged 200+ pull requests in 2026, every one of them built with AI coding agents, and reviewed 211 from 33 authors. He works in TypeScript, JavaScript, Go, Python and SQL.
**Next:** tech-stack, github
**Link:** #about

### 10. engineer-or-manager
**Asks like:** Is he an engineer or a manager? · Is he a builder or a people manager? · Does he still code as a manager? · PM or engineer? · Individual contributor or manager? · IC? · Technical manager · Player-coach · Does he do code review?
**Answer:** Both. His title is manager, and he still ships code.
**Detail:**
He merged 200+ of his own pull requests in 2026 and reviewed 211 from 33 authors. He's also the consultative partner and primary PR approver for 5 builders, and he leads the outsourced support team working live cases in the AI workspace he built.
**Next:** leadership, can-he-code
**Link:** #about

### 11. tech-stack
**Asks like:** What languages does he know? · What's his tech stack? · What tools does he use? · Does he know React? · Python? Go? · Frameworks · Skills list · Toolkit · Technologies · JavaScript · Node
**Answer:** TypeScript and React on the front end, Node, Go and Fastify on the back end, Snowflake for data, and Claude Code for building with AI.
**Highlights:**
- Frontend: React 18 and 19, TypeScript, Zustand, React Query, Recharts, Vite.
- Backend: Node.js, Go, Fastify, GraphQL, REST, Prometheus.
- AI: retrieval (RAG) design and evaluation, AI gateways, MCP servers, the Claude API and Agent SDK, local models.
- Data: Snowflake, SQL, Python, Bayesian analysis, A/B design.
**Next:** can-he-code, ai-experience
**Link:** #stack

### 12. ai-experience
**Asks like:** What AI work has he done? · AI experience? · Has he shipped AI to production? · LLM experience? · Generative AI · Large language models · AI products he's shipped · LLM projects
**Answer:** He ships production AI and gets people to actually use it.
**Detail:**
He built an AI copilot grounded in the support playbook, with cited sources, that an outsourced team now uses on live cases. He also rebuilt a production support chatbot so agents act on its answers instead of abandoning them.
He has trained 800+ people to put AI to work, and Anthropic's Claude Code team recognized him as one of Claude Code's top users.
**Next:** copilot, ai-quality
**Link:** #featured

### 13. rag
**Asks like:** Has he built RAG? · Retrieval experience? · How does he stop hallucinations? · Grounded answers? · Citations · Grounding · Knowledge base answers · Vector search
**Answer:** Yes. His copilot answers from the playbook support agents are graded against, and every citation comes from retrieval, not from the model.
**Detail:**
Retrieval lives on the server: the playbook never ships to the browser, and the backend returns the matching sections with their provenance.
Testing on the real playbook instead of a fixture exposed four defects, including a rare-term scoring rule that is backwards for a support corpus. Retrieval changes are judged by displacement: they have to rescue the questions that used to return nothing without pushing down the answers that already worked.
**Next:** ai-quality, copilot
**Link:** work/ai-copilot-rollout.html

### 14. claude-code
**Asks like:** How does he use Claude Code? · How does he build with AI agents? · What's his AI workflow? · Agent fleet? · Coding agents · AI pair programming · Agentic coding · Skills and hooks · agent-os
**Answer:** He runs Claude Code like a team: a playbook, shared memory, the right tools, and a review before anything ships.
**Detail:**
Big builds run as a fleet of agents in parallel lanes, merged only after a reviewer signs off on types, tests, real-GPU screenshots and a frame-time budget.
Work he repeats becomes a skill, hooks handle what nobody should have to remember, and a mistake that shows up three times becomes a written rule. The core is open source as agent-os.
**Next:** power-user, mcp
**Link:** #build

### 15. power-user
**Asks like:** What's the Claude Code power user thing? · Did Anthropic recognize him? · Top Claude Code user? · Anthropic card · Anthropic recognition · Top user
**Answer:** In 2026, Anthropic's Claude Code team recognized him as one of Claude Code's top users.
**Detail:**
Their card reads: "You're one of Claude Code's top users, and we wouldn't be here without you. Thank you for building with us." It came with a plush, a pin, stickers and a cap.
**Next:** claude-code, awards
**Link:** #build

### 16. mcp
**Asks like:** Does he know MCP? · Has he built MCP servers? · Model Context Protocol? · MCP tools · Tool servers for agents
**Answer:** Yes. He uses MCP servers to give agents real tools instead of guesses, and builds the server when nothing fits.
**Detail:**
That means a browser to test in, current library docs, and the data a task needs.
**Next:** claude-code, tech-stack
**Link:** #build

### 17. github
**Asks like:** Where's his code? · GitHub? · Open source? · Can I see his code? · Repositories · Public projects · Source code · Portfolio code
**Answer:** His public work is on GitHub as @desertcache.
**Detail:**
That includes agent-os, his Claude Code setup of hooks, skills, memory and a session lifecycle, plus Starship Explorer and Samantha UI, both of which run right here in the browser. His DoorDash work is internal, so the site shows it as case studies.
**Next:** side-projects, claude-code
**Link:** https://github.com/desertcache

### 18. data
**Asks like:** Does he know SQL? · Data skills? · Snowflake? · Analytics experience? · Analytics · Databases · Data engineering · Dashboards · Statistics
**Answer:** Yes. He builds on Snowflake and SQL, from production data apps to the org's first cost model.
**Detail:**
He built the org's first cost-per-task model on live warehouse data, and a workforce platform with Erlang C staffing math on live Snowflake data. He also works in Bayesian analysis, A/B design and ETL.
**Next:** cost-model, workforce-platform
**Link:** #stack

## C. Work at DoorDash

### 19. copilot
**Asks like:** What's his best work? · What's the featured project? · Tell me about the AI copilot · What's he most proud of? · Flagship project · Support copilot · Most impressive work · Featured work
**Answer:** An AI copilot for support agents who diagnose point-of-sale integration cases, answering from the same playbook they are graded on.
**Detail:**
It went from first prototype to internal pilot in 4 weeks. One workspace gathers a case's context from half a dozen internal systems, so agents stop hopping between tools.
Other teams now run their own AI agents inside it, an outsourced team works live cases in it, and usage grew well past the pre-pilot baseline.
**Next:** rollout, rag
**Link:** work/ai-copilot-rollout.html

### 20. rollout
**Asks like:** How did he roll it out? · Tell me about the outsourced team · Forward deployed experience? · Deployment story? · Vendor onboarding · Going live · Pilot to production · Access problems · Training kit · Forward deployed
**Answer:** The first outsourced team couldn't get in, and every failure looked like the same generic error, so he proved their access one layer at a time.
**Detail:**
He checked identity first, then device and network trust, then app permissions, and finally found an internal call that was blocked and showed up as a network error. Each layer got its own check, so the next cohort wouldn't repeat the hunt.
Training is generated from one source module, with a verifier that checks every copy, and he now coaches the team's live cases against a resolution-time target.
**Next:** copilot, hardest-problem
**Link:** work/ai-copilot-rollout.html

### 21. enablement
**Asks like:** Tell me about the AI training · How many people has he trained? · Workshops? · AI enablement? · Teaching? · Training program · Teaching AI · How many people trained · Sessions · Upskilling
**Answer:** 800+ people trained to put AI to work, with adoption counted instead of attendance.
**Detail:**
It started as a workshop for senior leaders at a leadership summit, built on a reusable four-step framework, and it won a Merchant Services Excellence Award. It grew into an org-wide series of 70 to 100+ people a session, each ending with something people keep using: a skill, a template or a shared team setup.
When access turned out to be the real blocker, he split one session into four parts and started with five words: repository, branch, commit, pull request, merge. He also wrote the org's AI builder playbook.
**Next:** non-technical, measurement
**Link:** work/ai-adoption-program.html

### 22. api-migration
**Asks like:** Tell me about the API migration · Program management experience? · Business case? · Partner migration? · POS migration · API sunset · Revenue retention · Budget · Program management · Vendor pod
**Answer:** A POS partner sunset its API with a large base of active stores still on it. He ran the 8-month program that kept nearly all of the at-risk revenue, under budget.
**Detail:**
He co-wrote the funding case and modeled four investment options, putting white-glove vendor help only on the highest-revenue stores, and he built the dashboard that ran the program, with the full funnel and the revenue at every stage.
Escalations fell from daily to a few a week, and the training behind it won a Merchant Services Excellence Award.
**Next:** leadership, cost-model
**Link:** #work

### 23. mapping-engine
**Asks like:** What's the mapping engine? · Full-stack product? · Snowflake app? · Spreadsheet replacement · Fastify · React and Snowflake app · Package owner
**Answer:** He turned a multi-day spreadsheet workflow into a real-time product on React, Fastify and Snowflake, and he's its declared package owner.
**Detail:**
He fixed the driver-level bugs teams lose weeks to: a browser-auth race that opened multiple tabs, a callback that silently dropped the warehouse connection, and a silent row cap. It now lives inside the broader workforce platform.
**Next:** workforce-platform, hardest-problem
**Link:** #work

### 24. workforce-platform
**Asks like:** What's the workforce platform? · Staffing tool? · Dashboards? · Erlang C? · Staffing · Service levels · SLA · Outsourced vendors
**Answer:** One real-time view of queues, service levels and staffing across outsourced vendors, replacing a legacy SaaS tool.
**Detail:**
It runs on live Snowflake data with Erlang C staffing math, and an operations lead outside the team validated the numbers against the legacy system.
A column-by-column parity check once caught a "fresher" table that would have silently pushed a metric to 100%, so it now runs before any table swap. It has shipped on a weekly release cadence through 2026.
**Next:** mapping-engine, data
**Link:** #work

### 25. chatbot
**Asks like:** Tell me about the chatbot · Prompt engineering? · How did he fix adoption? · AI agent he built? · Support bot · Answer format · Wall of text · Prompt redesign · Agent adoption
**Answer:** He was tech lead on a production AI agent for merchant support specialists, and it had an adoption problem: "wall of text, then abandon."
**Detail:**
He rebuilt the prompt around six fixed sections that lead with what to do next. Answers shrank to a fraction of their old length with accuracy held, it led adoption among the internal AI agents, and other agents now reuse the template.
**Next:** ai-quality, copilot
**Link:** #work

### 26. cost-model
**Asks like:** Cost-per-task model? · Financial modeling? · Does he do finance or business cases? · Cost per task · Support costs · Finance · Business modeling
**Answer:** The org's first model of what a unit of support work costs, in-house and at vendors, so automation gets judged against real money.
**Detail:**
It's built on live warehouse data, with a lineage tab that shows the exact query and a worked example, and it was validated with the senior director before becoming a dashboard with a weekly refresh.
The inputs are compensation data, so only pre-aggregated figures leave the warehouse, small groups are suppressed, and each refresh has to reconcile before it publishes.
**Next:** data, api-migration
**Link:** #work

### 27. screenshots
**Asks like:** Can I see screenshots? · Why are there no screenshots? · Can I see the DoorDash code? · Demo of his work? · Pictures of his work · Internal tools · Confidential · Can I see it?
**Answer:** His DoorDash work is internal, so the site shows it as schematics and case studies instead of screenshots.
**Detail:**
Two public write-ups go deeper: the AI copilot rollout and the AI adoption program. For things you can open yourself, try the Lab demos and his GitHub.
**Next:** copilot, github
**Link:** #work

## D. Leadership and how he works

### 28. leadership
**Asks like:** Does he manage people? · Leadership experience? · How many reports does he have? · Has he led teams? · Team lead · Led teams · People management · Mentoring
**Answer:** Yes, in three very different settings: builders, outsourced support teams and emergency response.
**Highlights:**
- Consultative partner and primary PR approver for 5 builders.
- Built and led two outsourced support teams, including the one working live cases in the AI workspace today.
- Led a 12-person crisis-response team as a volunteer EMT.
- At AZ Pain Doctors, hired and trained 16 coordinators.
**Next:** engineer-or-manager, executives
**Link:** #about

### 29. awards
**Asks like:** Awards? · Recognition? · Achievements? · What has he won? · Honors · Recognition · Promotions
**Answer:** Two Merchant Services Excellence Awards, three promotions in four years, and recognition from Anthropic's Claude Code team.
**Highlights:**
- 2025 Excellence Awards from senior leadership: one for the AI leadership workshop, one for the POS migration training.
- Promoted three times in four years at DoorDash, most recently to AI Solutions Manager in September 2026.
- Recognized in 2026 as one of Claude Code's top users.
**Next:** power-user, enablement
**Link:** #about

### 30. how-he-works
**Asks like:** How does he work? · Work style? · Principles? · What's his approach? · Philosophy · Values · Working principles · Approach · Methodology
**Answer:** Five rules he works by.
**Highlights:**
- Measure on the real thing: a test fixture hid four retrieval bugs that the real playbook exposed.
- Two agreeing documents are one source: load the live page before trusting either.
- "The code exists" isn't "the user can do it": list the actions an AI can actually reach before promising what it can resolve.
- Count adoption, not attendance. And a fix is done only when every copy is fixed.
**Next:** ai-quality, measurement
**Link:** #about

### 31. executives
**Asks like:** Does he work with executives? · Stakeholder management? · Who comes to him? · Senior leadership · Directors · Executive stakeholders · Advisor · Influence
**Answer:** Directors and senior engineers across the org come to him for AI tooling guidance.
**Detail:**
New requests from adjacent orgs follow most of his workshops and live demos. He built the AI workshop for senior leaders at an org leadership summit, and his cost model was validated with the senior director.
**Next:** enablement, leadership
**Link:** #about

### 32. hardest-problem
**Asks like:** What's the hardest problem he's solved? · Biggest challenge? · Toughest bug? · Tell me about a time something went wrong · How does he debug? · Problem solving
**Answer:** Getting the first outsourced team into the AI workspace, when every failure looked like the same generic error.
**Detail:**
He proved access one layer at a time: identity, device and network trust, app permissions, and finally an internal call that was blocked and showed up as a network error. Each layer got its own check, so the next cohort wouldn't repeat the hunt.
In data work he fixes problems at the driver level, like a browser-auth race that looped and opened multiple tabs.
**Next:** rollout, mapping-engine
**Link:** work/ai-copilot-rollout.html

### 33. measurement
**Asks like:** How does he measure success? · What metrics does he use? · How does he prove impact? · KPIs? · Does he track outcomes? · Results
**Answer:** He measures the outcome, not the activity.
**Highlights:**
- Training counts who reaches each step, starting with the last access step, not who showed up.
- The copilot's usage is tracked against the pre-pilot baseline, and its team is coached against a resolution-time target.
- Retrieval changes are judged by displacement: rescue the misses without pushing down the answers that already worked.
**Next:** ai-quality, enablement
**Link:** work/ai-adoption-program.html

### 34. ai-quality
**Asks like:** How does he evaluate AI? · How does he know the AI is accurate? · AI evals? · Evaluation · Testing AI systems
**Answer:** He tests AI on real data, against gates it has to pass, not on demos.
**Detail:**
Retrieval is measured on the real playbook, where it exposed four defects a test fixture had hidden. Model changes are proven through the company's AI gateway with a control, the new setting, and a request that should fail, and citations come from retrieval, so the model never invents a source.
This box works the same way: it has to hold its score on questions it never saw while being tuned before any change goes live.
**Next:** rag, this-box
**Link:** work/ai-copilot-rollout.html

### 35. non-technical
**Asks like:** Can he work with non-technical people? · Is he a good communicator? · Can he make technical topics simple for others? · Does he teach beginners? · Communication skills
**Answer:** Yes. He teaches non-engineers to build with AI, in sessions of 70 to 100+ people.
**Detail:**
With non-technical rooms he leads with five words (repository, branch, commit, pull request, merge) and one promise: everything can be undone, and you're not an admin.
When the first attendee hit a wall in the access flow, he fixed the path with screenshots that afternoon, and every access request was granted by the next morning. He came up through operations and emergency medicine, coordinating fire, medical and police on scene.
**Next:** enablement, executives
**Link:** work/ai-adoption-program.html

### 36. pressure
**Asks like:** Has he handled escalations? · Incident response experience? · Can he work under pressure? · Crisis management? · High-pressure situations
**Answer:** Yes. Pressure is where he started.
**Detail:**
At DoorDash he was one of a small team on executive-level merchant escalations, 50+ cases a day, leading incident response across engineering, operations and vendor teams, and he built the SQL tooling, Salesforce reports and prevention playbooks that cut repeat incidents.
Before tech, he triaged on scene as a volunteer EMT and led a 12-person crisis-response team.
**Next:** emt, hardest-problem
**Link:** #about

## E. The Lab and this site

### 37. side-projects
**Asks like:** What side projects has he built? · Side projects? · Personal projects? · What does he build for fun? · Local AI tools · Velvet · AI Radio
**Answer:** Local-first AI tools and playable demos, mostly built with a fleet of AI coding agents.
**Highlights:**
- Velvet: Electron, Three.js and GLSL, with on-device Whisper speech-to-text.
- Samantha: the audio-reactive orb in this bar, in React 19 and Three.js.
- AI Radio: local models through Ollama, voiced with F5-TTS.
- Starship Explorer, the arcade, and agent-os, his Claude Code setup.
**Next:** starship, github
**Link:** #lab

### 38. starship
**Asks like:** What's the starship? · Starship Explorer? · Three.js game? · Spaceship · Starship game · Three.js · Procedural generation
**Answer:** A first-person walkable starship in Three.js with zero asset files: every panel, texture and planet outside the windows is generated at runtime.
**Detail:**
He built it with a fleet of Claude Code agents he directed, gated by an automated screenshot-verify pipeline. It runs in a desktop browser.
**Next:** claude-code, arcade
**Link:** starship.html

### 39. orb
**Asks like:** What's the orb? · Samantha UI? · What's the glowing sphere? · Samantha · Shader orb · GLSL · Her movie
**Answer:** A Her-inspired soul orb: one GPU-displaced sphere with custom GLSL shaders, audio-reactive at 60fps.
**Detail:**
It's the orb in this bar: it idles while you read, turns violet while it searches, and glows coral while the answer appears. It's built with React 19, Three.js and GLSL.
**Next:** this-box, side-projects
**Link:** #lab

### 40. arcade
**Asks like:** What's the arcade? · Pac-Man? · Can I play a game? · Games · Pac-Man · Arcade games · Canvas games
**Answer:** Five games in vanilla JS on raw canvas, including a dot-for-dot Pac-Man rebuild with the authentic ghost AI.
**Detail:**
The original ghost targeting is in there, overflow bug included, and it went from first commit to live in a day.
**Next:** starship, claude-code
**Link:** arcade.html

### 41. hill-money-watch
**Asks like:** What's Hill Money Watch? · Congress stock trades? · The blog? · Congress trades · Politician trading · STOCK Act · Blog
**Answer:** A Claude Code skill that sweeps congressional trading disclosures, writes a digest, and publishes it through a validation step that rejects anything that breaks the contract.
**Detail:**
It reports the gap between trade and filing dates, and it never says in its own voice that anyone broke the law.
**Next:** claude-code, hobbies
**Link:** blog/index.html

### 42. this-box
**Asks like:** How does this work? · Is this AI? · Is this Sam? · Is this ChatGPT? · Does my question get sent anywhere? · Is this a chatbot? · Privacy · Is this an AI model? · What model is this?
**Answer:** A small AI model (about 4 MB) runs on your device and matches your question by meaning to answers Sam approved. It doesn't generate text, so it can't make anything up, and your question never leaves your browser.
**Detail:**
It reads your question as word pieces, turns it into 128 numbers, and compares those with every phrasing in its bank. The trace above each answer is that real work, slowed down so you can follow it.
On questions it never saw while being tuned, it puts the right answer first about four times in five.
**Next:** orb, ai-quality
**Link:** work/answer-finder.html

### 43. this-site
**Asks like:** How was this site built? · What's the site made with? · Is the map real? · Website tech · How was this website made? · Framework used for this site · Elevation map
**Answer:** Plain HTML, CSS and a little JavaScript, with no framework and no build step.
**Detail:**
The contour map up top and the mountains above the footer are real: Camelback and the Phoenix Mountains, drawn from USGS elevation data. Press the ` key to warp to the starship.
**Next:** starship, this-box
**Link:** #top

## F. Contact and logistics

### 44. contact
**Asks like:** How do I contact him? · Email? · LinkedIn? · How do I reach Sam? · Reach out · Get in touch · Email address · Message him
**Answer:** Email is fastest: batessambates@gmail.com. He's also on LinkedIn as samuel-b-343205133 and on GitHub as @desertcache.
**Next:** resume, why-hire
**Link:** #contact

### 45. resume
**Asks like:** Resume? · CV? · Can I download his resume? · Résumé PDF · Curriculum vitae
**Answer:** His résumé is a PDF linked at the top and bottom of this page.
**Next:** contact, career-path
**Link:** Samuel_Bates_CV.pdf

### 46. availability
**Asks like:** Is he looking for a job? · Is he open to work? · Is he hiring? · Can we interview him? · Open to opportunities? · Job search · Hiring him · Recruiting · New job · Interested in roles
**Answer:** That's a question for Sam directly: batessambates@gmail.com.
**Next:** contact, why-hire
**Link:** #contact

### 47. salary
**Asks like:** What's his salary? · Compensation expectations? · How much does he make? · Pay · Salary expectations · Money
**Answer:** That's a conversation for Sam directly: batessambates@gmail.com.
**Next:** contact, why-hire
**Link:** #contact

### 48. remote
**Asks like:** Is he open to remote? · Would he move? · Would he relocate? · Can he work on-site? · Remote work · Hybrid · In-office · Relocate · Move for a job · Work location
**Answer:** He's based in Phoenix. For anything about work arrangements, email Sam directly: batessambates@gmail.com.
**Next:** contact, location
**Link:** #contact

### 49. why-hire
**Asks like:** Why should I hire him? · What makes him different? · What's his edge? · Why him? · Strengths · Why him over others · Unique value · Selling points
**Answer:** He builds production AI, takes it live with the people who use it, and teaches organizations to adopt it.
**Detail:**
Most engineers don't have his path: every role he held ran the operations the next one automated. The copilot program shows the whole loop in one project (build it, prove it, roll it out, measure it), and he measures on the real thing, counting adoption, not attendance.
**Next:** copilot, how-he-works
**Link:** #featured

### 50. personal
**Asks like:** How old is he? · Is he married? · Politics? · Personal life? · Age · Married · Family · Religion · Girlfriend
**Answer:** This box only answers questions about Sam's work. For anything else, reach out to him directly.
**Next:** hobbies, contact
**Link:** #contact

## G. Small talk

### 51. greeting
**Kind:** chat
**Asks like:** Hi · Hello · Hey · Hey there · Good morning · Good afternoon · Howdy · Yo
**Answer:** Hi! I'm the little model behind this chat. Ask me anything about Sam's work: what he's built, how he leads, or how he got from the ER to production code.
**Next:** who-is-sam, copilot
**Link:** none

### 52. how-are-you
**Kind:** chat
**Asks like:** How are you? · How's it going? · What's up? · How are you doing today? · How's your day?
**Answer:** Running at about 4 MB and under a millisecond a question, so honestly, great. What would you like to know about Sam?
**Next:** who-is-sam, this-box
**Link:** none

### 53. capabilities
**Kind:** chat
**Asks like:** What can you do? · What do you know? · What can I ask you? · Help · What topics do you cover? · What should I ask?
**Answer:** I know Sam's work inside out: his AI projects, his DoorDash programs, how he leads and builds with AI agents, his background, and the demos on this site.
**Detail:**
What I don't know is everything else. No weather, no sports, no trivia, and I never make anything up: every answer I give is one Sam approved.
**Next:** copilot, career-path
**Link:** none

### 54. creator
**Kind:** chat
**Asks like:** Who built you? · Who made this bot? · Who programmed you? · Where did you come from?
**Answer:** Sam built me with his fleet of AI coding agents, and every answer I can give is one he approved.
**Detail:**
There's a build note in the Lab if you want the whole story: how the model was chosen, how it was tested, and how it's kept honest.
**Next:** this-box, claude-code
**Link:** work/answer-finder.html

### 55. joke
**Kind:** chat
**Asks like:** Got any jokes? · Say something funny · Make me laugh · Joke please · Are you funny?
**Answer:** I'd tell you one, but I can only say things Sam approved, and he's still workshopping the material.
**Detail:**
Here's something fun instead: there's a dot-for-dot Pac-Man down in the Lab, original ghost AI and its overflow bug included.
**Next:** arcade, starship
**Link:** arcade.html

### 56. compliment
**Kind:** chat
**Asks like:** This is cool · Impressive · Love it · Very cool · This is awesome · Wow · Well done
**Answer:** Thank you! I'll pass that along.
**Detail:**
If you want the story behind it, the starship and this bar both have build notes in the Lab, and Sam's always happy to talk shop: batessambates@gmail.com.
**Next:** starship, this-box
**Link:** none

### 57. thanks
**Kind:** chat
**Asks like:** Thanks · Thank you · Appreciate it · Thanks a lot · Cheers · Helpful
**Answer:** Anytime. If something here caught your eye, Sam's always happy to talk it through: batessambates@gmail.com.
**Next:** contact, why-hire
**Link:** none

### 58. goodbye
**Kind:** chat
**Asks like:** Bye · Goodbye · See you · That's all · I'm done · Gotta go
**Answer:** Thanks for stopping by. If you want to keep the conversation going, email Sam: batessambates@gmail.com.
**Next:** contact, resume
**Link:** none

### 59. no-match (fallback, shown when nothing scores above the threshold; one is picked at random)
**Answer:** No answer for that one yet. Try asking about his work, his AI projects or his background, or email Sam: batessambates@gmail.com.
**Also:**
That one's outside what I know. I only know Sam's work, but I know it well. Try one of these:
I'm a small model with one job, Sam's work, and that question is beyond it. These aren't:
Good question, wrong model: I only know Sam's work. Here's where I'd start:
