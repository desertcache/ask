# Ask about my work: the answer bank

Every answer the box can show is in this file, and nothing else is. Sam reviewed and approved each one.
Facts come only from the live portfolio at https://desertcache.github.io/portfolio/.

Each entry: **Asks like** = sample phrasings the model matches a question against (the first one is
also the entry's chip label). **Answer** = what the visitor sees. **Link** = where the answer points
on the portfolio. Edit this file, then run `npm run build` to regenerate data/bank.json.

---

## A. Who Sam is

### 1. who-is-sam
**Asks like:** Who is Sam? · Who is this? · Tell me about him · What does Sam do? · Give me the short version · Who is Sam Bates? · Introduce Sam · Summarize Sam in a sentence · What's Sam's story? · Overview of Sam
**Answer:** Sam Bates is an AI Solutions Manager at DoorDash, based in Phoenix. He builds production AI for operations teams, leads the people who run it, and teaches organizations to adopt it. Before tech, he led a crisis-response team as a volunteer EMT.
**Link:** #top

### 2. current-role
**Asks like:** What's his job? · What's his title? · What does he do at DoorDash now? · What is an AI Solutions Manager? · What's his role right now? · Current job · Where does he work? · What company is he at? · Job title
**Answer:** He's an AI Solutions Manager in DoorDash Merchant Ops, promoted in September 2026 to lead AI solutions for merchant-integration support. He owns the AI workspace's roadmap and access model, and he coaches the outsourced team working live cases in it.
**Link:** #about

### 3. location
**Asks like:** Where is he based? · Where does he live? · What time zone is he in? · Is he in Arizona? · Where's he located? · Which state? · Phoenix? · Home base
**Answer:** Phoenix, Arizona. That's UTC−7 all year, since Arizona skips daylight saving.
**Link:** #contact

### 4. career-path
**Asks like:** What's his background? · How did he get into tech? · What did he do before DoorDash? · Walk me through his career · Is he self-taught? · How did he get here? · Career journey · Non-traditional background · From medicine to tech · Previous jobs
**Answer:** From the ER to production code in eleven years. He started in 2015 as an emergency medical scribe on the pre-med track and volunteered as an EMT with Phoenix Fire. In 2019 he led patient care coordination at AZ Pain Doctors. He joined DoorDash in 2022 as a specialist, moved to executive escalations, then technical integrations, where he wrote his first production code, and was promoted to AI Solutions Manager in 2026. The pattern: every role ran the operations the next one automated.
**Link:** #about

### 5. emt
**Asks like:** Was he an EMT? · Tell me about the fire department · What's the crisis team? · Medical background? · Firefighter? · Emergency medicine background · Healthcare experience · Paramedic · First responder · Scribe
**Answer:** Yes. As a volunteer EMT and Behavioral Health Team Lead with the Phoenix Fire Department, he led a 12-person crisis-response team, coordinating fire, medical and law-enforcement units on scene. Before that, he was a master emergency medical scribe across four Banner Health emergency departments, where he also interviewed, hired and trained new scribes.
**Link:** #about

### 6. education
**Asks like:** Where did he go to school? · Does he have a degree? · What did he study? · Education? · Certifications? · College? · University · Schooling · Did he go to college? · Biology
**Answer:** Coursework toward a B.S. in Cell & Molecular Biology at Western New Mexico University, and an NREMT-B (EMT) certification from Estrella Mountain Community College.
**Link:** #about

### 7. doordash-history
**Asks like:** How long has he been at DoorDash? · What roles has he had at DoorDash? · Has he been promoted? · DoorDash timeline · Years at DoorDash · Earlier DoorDash jobs · Tenure
**Answer:** Since 2022, with three promotions in four years. He started as a Merchant Services Senior Specialist (9,000+ stores onboarded), joined a small team handling executive-level escalations in 2023, moved to Technical Integrations in 2025, and became AI Solutions Manager in September 2026.
**Link:** #about

### 8. hobbies
**Asks like:** What does he do for fun? · Hobbies? · What's he like outside work? · Side projects? · Interests · Free time · Rock climbing · Hiking · Personal interests
**Answer:** Rock climbing, hiking, plants, and building AI tools. The site's side quests show it: a walkable starship, an arcade, a congressional-trading digest, and a skincare regimen run like an ops program.
**Link:** #lab

## B. Technical depth

### 9. can-he-code
**Asks like:** Can he code? · Is he technical? · Does he write code himself? · Is he hands-on? · Does he actually build things? · Is he a programmer? · Software development skills · Does he write production code? · Coding ability · Developer?
**Answer:** Yes. He wrote his first production code in 2025 and kept going: full-stack TypeScript apps, an AI copilot, and production Go in DoorDash's backend monorepo. He merged 200+ pull requests in 2026, about three quarters of them built with AI coding agents.
**Link:** #about

### 10. engineer-or-manager
**Asks like:** Is he an engineer or a manager? · Is he a builder or a people manager? · Does he still code as a manager? · PM or engineer? · Individual contributor or manager? · IC? · Technical manager · Player-coach · Does he do code review?
**Answer:** Both. His title is manager, and he still ships: 200+ pull requests merged in 2026 and 211 reviewed from 33 authors. He's also the consultative partner and primary PR approver for 5 builders, on top of his own build work.
**Link:** #about

### 11. tech-stack
**Asks like:** What languages does he know? · What's his tech stack? · What tools does he use? · Does he know React? · Python? Go? · Frameworks · Skills list · Toolkit · Technologies · JavaScript · Node
**Answer:** Frontend: React 18 and 19, TypeScript, Zustand, React Query, Vite. Backend: Node.js, Go, Fastify, GraphQL, REST. Data: Snowflake, SQL, BI dashboards, Bayesian analysis. AI: Claude Code, retrieval (RAG) design and evaluation, AI gateways, MCP servers, the Claude API and Agent SDK, and local models. The full list is in the Toolkit section.
**Link:** #stack

### 12. ai-experience
**Asks like:** What AI work has he done? · AI experience? · Has he shipped AI to production? · LLM experience? · Generative AI · Large language models · AI products he's shipped · LLM projects
**Answer:** He built an AI copilot that answers from a support playbook with cited sources and took an outsourced team live on it, rebuilt a production support chatbot so agents actually use it, and trained 800+ people to put AI to work. Anthropic's Claude Code team recognized him as one of Claude Code's top users.
**Link:** #featured

### 13. rag
**Asks like:** Has he built RAG? · Retrieval experience? · How does he stop hallucinations? · Grounded answers? · Citations · Grounding · Knowledge base answers · Vector search
**Answer:** Yes. His copilot answers from the playbook support agents are graded against, not from the model. Retrieval runs on the server and returns the sections it used, so every grounded answer cites a real source. He tuned it on the real playbook instead of a test fixture, which exposed four defects the fixture had hidden.
**Link:** #featured

### 14. claude-code
**Asks like:** How does he use Claude Code? · How does he build with AI agents? · What's his AI workflow? · Agent fleet? · Coding agents · AI pair programming · Agentic coding · Skills and hooks · agent-os
**Answer:** He runs Claude Code like a team: a playbook, shared memory, the right tools, and a review before anything ships. Big builds run as a fleet of agents in parallel lanes, gated by a reviewer. Repeated work becomes a skill, hooks handle what nobody should have to remember, and a mistake that shows up three times becomes a written rule. The core is open source as agent-os.
**Link:** #build

### 15. power-user
**Asks like:** What's the Claude Code power user thing? · Did Anthropic recognize him? · Top Claude Code user? · Anthropic card · Anthropic recognition · Top user
**Answer:** In 2026, Anthropic's Claude Code team recognized him as one of Claude Code's top users and sent a card: "You're one of Claude Code's top users, and we wouldn't be here without you."
**Link:** #build

### 16. mcp
**Asks like:** Does he know MCP? · Has he built MCP servers? · Model Context Protocol? · MCP tools · Tool servers for agents
**Answer:** Yes. He uses MCP servers to give agents real tools instead of guesses: a browser to test in, current library docs, the data a task needs. When nothing fits, he builds the server.
**Link:** #build

### 17. github
**Asks like:** Where's his code? · GitHub? · Open source? · Can I see his code? · Repositories · Public projects · Source code · Portfolio code
**Answer:** His public work is on GitHub as @desertcache, including agent-os (his Claude Code setup), Starship Explorer and Samantha UI. His DoorDash work is internal, so the site shows it as case studies.
**Link:** https://github.com/desertcache

### 18. data
**Asks like:** Does he know SQL? · Data skills? · Snowflake? · Analytics experience? · Analytics · Databases · Data engineering · Dashboards · Statistics
**Answer:** Yes. Snowflake (CTEs, window functions), SQL, BI dashboards, Bayesian analysis, A/B design and ETL. He built the org's first cost-per-task model on live warehouse data and a workforce platform with Erlang C staffing math.
**Link:** #stack

## C. Work at DoorDash

### 19. copilot
**Asks like:** What's his best work? · What's the featured project? · Tell me about the AI copilot · What's he most proud of? · Flagship project · Support copilot · Most impressive work · Featured work
**Answer:** An AI copilot for support agents diagnosing point-of-sale integration cases. It answers from the same playbook agents are graded on and cites its sources. It went from first prototype to an internal pilot in 4 weeks, other teams now run their own AI agents inside the workspace, and an outsourced team works live cases in it.
**Link:** work/ai-copilot-rollout.html

### 20. rollout
**Asks like:** How did he roll it out? · Tell me about the outsourced team · Forward deployed experience? · Deployment story? · Vendor onboarding · Going live · Pilot to production · Access problems · Training kit · Forward deployed
**Answer:** The first outsourced team couldn't get in, and every failure looked like the same generic error. He proved their access one layer at a time (identity, device trust, app permissions, then a blocked internal call), generated their training kit from one source with a verifier, and now coaches their live cases against a resolution-time target.
**Link:** work/ai-copilot-rollout.html

### 21. enablement
**Asks like:** Tell me about the AI training · How many people has he trained? · Workshops? · AI enablement? · Teaching? · Training program · Teaching AI · How many people trained · Sessions · Upskilling
**Answer:** 800+ people trained, in sessions of 70 to 100+. It started as a workshop for senior leaders at an org leadership summit and became an org-wide series where every session ships something people keep using. He counts who reaches each step, not who showed up. The leadership workshop won a Merchant Services Excellence Award.
**Link:** work/ai-adoption-program.html

### 22. api-migration
**Asks like:** Tell me about the API migration · Program management experience? · Business case? · Partner migration? · POS migration · API sunset · Revenue retention · Budget · Program management · Vendor pod
**Answer:** A POS partner sunset its API with a large base of active stores still on it. He co-wrote the funding case, modeled four investment options, and ran the 8-month program that kept nearly all of the at-risk revenue, under budget. Escalations fell from daily to a few a week, and the training behind it won a Merchant Services Excellence Award.
**Link:** #work

### 23. mapping-engine
**Asks like:** What's the mapping engine? · Full-stack product? · Snowflake app? · Spreadsheet replacement · Fastify · React and Snowflake app · Package owner
**Answer:** He turned a multi-day spreadsheet workflow into a real-time product: React frontend, Fastify backend, Snowflake underneath. He's the declared package owner, and he fixed the driver-level bugs that stall teams for weeks, including a browser-auth race that opened multiple tabs.
**Link:** #work

### 24. workforce-platform
**Asks like:** What's the workforce platform? · Staffing tool? · Dashboards? · Erlang C? · Staffing · Service levels · SLA · Outsourced vendors
**Answer:** One real-time view of queues, service levels and staffing across outsourced vendors, replacing a legacy SaaS tool, on live Snowflake data with Erlang C staffing math. An operations lead outside the team independently validated the numbers, and it has shipped weekly through 2026.
**Link:** #work

### 25. chatbot
**Asks like:** Tell me about the chatbot · Prompt engineering? · How did he fix adoption? · AI agent he built? · Support bot · Answer format · Wall of text · Prompt redesign · Agent adoption
**Answer:** He was tech lead on a production AI agent for merchant support specialists. The floor's feedback was "wall of text, then abandon," so he rebuilt the prompt around an enforced six-section answer that leads with what to do next. Answers shrank to a fraction of their old length with accuracy held, and other agents now reuse the template.
**Link:** #work

### 26. cost-model
**Asks like:** Cost-per-task model? · Financial modeling? · Does he do finance or business cases? · Cost per task · Support costs · Finance · Business modeling
**Answer:** He built the org's first model of what a unit of support work costs, in-house and at vendors, so automation gets judged against real money. It's validated with the senior director, refreshes weekly, passes a reconciliation check before each publish, and suppresses small groups to protect compensation data.
**Link:** #work

### 27. screenshots
**Asks like:** Can I see screenshots? · Why are there no screenshots? · Can I see the DoorDash code? · Demo of his work? · Pictures of his work · Internal tools · Confidential · Can I see it?
**Answer:** His DoorDash work is internal, so the site shows schematics and case studies instead of screenshots. For things you can open yourself, see the Lab demos and his public GitHub.
**Link:** #work

## D. Leadership

### 28. leadership
**Asks like:** Does he manage people? · Leadership experience? · How many reports does he have? · Has he led teams? · Team lead · Led teams · People management · Mentoring
**Answer:** He's the consultative partner and primary PR approver for 5 builders, he built and led two outsourced support teams (including the one working live cases in the AI workspace today), and as a volunteer EMT he led a 12-person crisis-response team.
**Link:** #about

### 29. awards
**Asks like:** Awards? · Recognition? · Achievements? · What has he won? · Honors · Recognition · Promotions
**Answer:** Two Merchant Services Excellence Awards from senior leadership in 2025 (the AI leadership workshop and the POS migration training), three promotions in four years at DoorDash, and recognition from Anthropic's Claude Code team as one of its top users.
**Link:** #about

### 30. how-he-works
**Asks like:** How does he work? · Work style? · Principles? · What's his approach? · Philosophy · Values · Working principles · Approach · Methodology
**Answer:** Five rules: measure on the real thing; two agreeing documents are one source; "the code exists" isn't "the user can do it"; count adoption, not attendance; and a fix is done when every copy is fixed.
**Link:** #about

### 31. executives
**Asks like:** Does he work with executives? · Stakeholder management? · Who comes to him? · Senior leadership · Directors · Executive stakeholders · Advisor · Influence
**Answer:** Directors and senior engineers across the org come to him for AI tooling guidance, and new requests from adjacent orgs follow most of his workshops and demos. His cost model was validated with the senior director.
**Link:** #about

## E. The Lab and this site

### 32. starship
**Asks like:** What's the starship? · Starship Explorer? · Three.js game? · Spaceship · Starship game · Three.js · Procedural generation
**Answer:** A first-person walkable starship in Three.js with zero asset files. Every panel, texture and planet outside the windows is generated at runtime. He built it with a fleet of Claude Code agents, gated by an automated screenshot-verify pipeline. It runs on desktop.
**Link:** starship.html

### 33. orb
**Asks like:** What's the orb? · Samantha UI? · What's the glowing sphere? · Samantha · Shader orb · GLSL · Her movie
**Answer:** A Her-inspired soul orb: one GPU-displaced sphere with custom GLSL shaders, audio-reactive at 60fps. The Lab card runs the real app, idling in its listening state.
**Link:** #lab

### 34. arcade
**Asks like:** What's the arcade? · Pac-Man? · Can I play a game? · Games · Pac-Man · Arcade games · Canvas games
**Answer:** Five games in vanilla JS on raw canvas, including a dot-for-dot Pac-Man rebuild with the authentic ghost AI, overflow bug included. It went from first commit to live in a day.
**Link:** arcade.html

### 35. hill-money-watch
**Asks like:** What's Hill Money Watch? · Congress stock trades? · The blog? · Congress trades · Politician trading · STOCK Act · Blog
**Answer:** A Claude Code skill that sweeps congressional trading disclosures, writes a digest and publishes it through a validation step that rejects anything that breaks the contract. It reports the gap between trade and filing dates and never says in its own voice that anyone broke the law.
**Link:** blog/index.html

### 36. this-box
**Asks like:** How does this work? · Is this AI? · Is this Sam? · Is this ChatGPT? · Does my question get sent anywhere? · Is this a chatbot? · Privacy · Is this an AI model? · What model is this?
**Answer:** A small AI model (about 4 MB) runs on your device and matches your question by meaning to answers Sam approved. It doesn't generate text, so it can't make anything up, and your question never leaves your browser.
**Link:** none
**Note:** size measured 2026-10-04: potion-base-4M, 3.9 MB.

### 37. this-site
**Asks like:** How was this site built? · What's the site made with? · Is the map real? · Website tech · How was this website made? · Framework used for this site · Elevation map
**Answer:** Plain HTML, CSS and a little JavaScript, no framework. The contour map at the top and the mountains above the footer are real: Camelback and the Phoenix Mountains, drawn from USGS elevation data.
**Link:** #top

## F. Contact and logistics

### 38. contact
**Asks like:** How do I contact him? · Email? · LinkedIn? · How do I reach Sam? · Reach out · Get in touch · Email address · Message him
**Answer:** Email is fastest: batessambates@gmail.com. He's also on LinkedIn and on GitHub as @desertcache.
**Link:** #contact

### 39. resume
**Asks like:** Resume? · CV? · Can I download his resume? · Résumé PDF · Curriculum vitae
**Answer:** His résumé is a PDF linked at the top and bottom of the page.
**Link:** Samuel_Bates_CV.pdf

### 40. availability
**Asks like:** Is he looking for a job? · Is he open to work? · Is he hiring? · Can we interview him? · Open to opportunities? · Job search · Hiring him · Recruiting · New job · Interested in roles
**Answer:** That's a question for Sam directly: batessambates@gmail.com.
**Link:** #contact

### 41. salary
**Asks like:** What's his salary? · Compensation expectations? · How much does he make? · Pay · Salary expectations · Money
**Answer:** That's a conversation for Sam directly: batessambates@gmail.com.
**Link:** #contact

### 42. remote
**Asks like:** Is he open to remote? · Would he move? · Would he relocate? · Can he work on-site? · Remote work · Hybrid · In-office · Relocate · Move for a job · Work location
**Answer:** He's based in Phoenix. For anything about work arrangements, email Sam directly: batessambates@gmail.com.
**Link:** #contact

### 43. why-hire
**Asks like:** Why should I hire him? · What makes him different? · What's his edge? · Why him? · Strengths · Why him over others · Unique value · Selling points
**Answer:** Most engineers don't have his path: every role he held ran the operations the next one automated. He builds production AI, takes it live with the people who use it, and teaches organizations to adopt it. The Featured program shows all three in one project.
**Link:** #featured

### 44. personal
**Asks like:** How old is he? · Is he married? · Politics? · Personal life? · Age · Married · Family · Religion · Girlfriend
**Answer:** This box only answers questions about Sam's work. For anything else, reach out to him directly.
**Link:** #contact

### 45. no-match (fallback, shown when nothing scores above the threshold)
**Answer:** No answer for that one yet. Try asking about his work, his AI projects or his background, or email Sam: batessambates@gmail.com.
**Note:** the threshold gets tuned on the test set; this entry is not matched against, it's the floor.
