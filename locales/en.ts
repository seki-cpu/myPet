import type { PawMatchMessages } from '@/locales/types';

export const enMessages: PawMatchMessages = {
  meta: {
    title: 'PawMatch — What dog breed are you?',
    description: 'A lighthearted 10-question quiz to discover your dog personality.',
  },
  language: {
    label: 'Choose language',
    zh: '中文',
    ja: '日本語',
    en: 'English',
  },
  home: {
    eyebrow: 'PawMatch Personality Quiz',
    title: 'If you were a dog, what breed would you be?',
    description: '🐾 Discover your inner dog vibe 🐾',
    start: 'Start the quiz',
    meta: '10 questions · about 1 minute · just for fun',
  },
  quiz: {
    previous: 'Previous',
    next: 'Next',
    reveal: 'Reveal my breed',
    progress: '{current} / {total}',
    home: 'Back home',
  },
  result: {
    revealTitle: 'Your dog personality is—',
    secondaryPrefix: 'You also have a little {breed} in you',
    cuteFlawLabel: 'Your adorably tiny flaw',
    saveImage: 'Save image',
    share: 'Share result',
    email: 'Send by email',
    copy: 'Copy result text',
    copied: 'Copied',
    retry: 'Take it again',
    loading: 'Loading...',
    privacy: 'Your PawMatch answers and result are processed entirely in your browser. This version requires no login and does not collect your name, email address, or complete answer set.',
    entertainment: 'This quiz is for entertainment. Breed personalities are creative characterizations, not professional assessments of real breeds, individual dogs, or the user’s psychological traits.',
  },
  notices: {
    entertainment: 'This quiz is for entertainment. Breed personalities are creative characterizations, not professional assessments of real breeds, individual dogs, or the user’s psychological traits.',
    privacy: 'Your PawMatch answers and result are processed entirely in your browser. This version requires no login and does not collect your name, email address, or complete answer set.',
    imageFallback: 'We couldn’t create the image. Take a screenshot or copy the result text instead.',
    attachmentHint: 'Image saved. Please attach it to your email manually.',
  },
  questions: {
    q1: {
      text: 'It’s finally the weekend — what do you want to do most?',
      options: { A: 'Couch potato mode: movies and no one better call me', B: 'Dinner and chat with familiar friends', C: 'Walk, exercise, or hike in the park', D: 'Head out on a spontaneous adventure to a new place' },
    },
    q2: {
      text: 'You walk into a party full of strangers. What do you usually do?',
      options: { A: 'After ten minutes, you’re already chatting with everyone', B: 'Find one friendly-looking person and start talking', C: 'Observe quietly and open up once you’re comfortable', D: 'Stand beside a friend and quietly judge everyone' },
    },
    q3: {
      text: 'When faced with a new task, what’s your first reaction?',
      options: { A: 'Jump in and learn as you go', B: 'Study it first, then make a plan', C: 'Bring people along to build energy together', D: 'See if I’m interested; if not, leave it for later' },
    },
    q4: {
      text: 'A friend cancels a plan last minute. What do you do?',
      options: { A: 'Immediately find another plan', B: 'Feel a bit disappointed, then arrange your own fun', C: 'Pretend you’re fine but quietly remember it', D: 'Great, finally some alone time' },
    },
    q5: {
      text: 'What word do your friends most often use to describe you?',
      options: { A: 'Warm and energetic', B: 'Reliable and gentle', C: 'Smart and a bit serious', D: 'Independent and distinctive' },
    },
    q6: {
      text: 'When you get lost, how do you usually handle it?',
      options: { A: 'Confidently keep going; the plot gets more interesting', B: 'Open the map and fix the route quickly', C: 'Ask someone for help and make a new friend', D: 'I wasn’t lost; I just chose another path' },
    },
    q7: {
      text: 'When a team suddenly falls into chaos, what are you like?',
      options: { A: 'Lift the atmosphere and calm everyone down first', B: 'Organize tasks and push things forward one step at a time', C: 'Check who’s struggling and take care of them', D: 'Point out the real problem even if people don’t love it' },
    },
    q8: {
      text: 'If you could choose one superpower, what would you want?',
      options: { A: 'Mind-reading: instantly know what everyone is thinking', B: 'Clone power: complete everything at once', C: 'Teleportation: go anywhere anytime', D: 'Super senses: notice details others miss' },
    },
    q9: {
      text: 'When faced with rules, which are you more like?',
      options: { A: 'I follow them if they make sense, and discuss if not', B: 'Rules make me feel safe, so I’ll follow them carefully', C: 'First I’ll see if I can bend them a little', D: 'I have my own rules, thank you' },
    },
    q10: {
      text: 'How do you usually express affection?',
      options: { A: 'Say it warmly and get closer', B: 'Quietly remember and look after their needs', C: 'Do fun things together and make memories', D: 'I may not say it often, but I’ll always stay close' },
    },
  },
  breeds: {
    'golden-retriever': { name: 'Golden Retriever', tags: ['Warm', 'Friendly', 'Comfort'], summary: 'You make it easy for people to relax. You listen well and naturally pull anyone who feels left out into the group. Your emotions are real, but you often lead with care for the atmosphere and others first.', flaw: 'Sometimes you try so hard to keep everyone happy that you forget to rest yourself.', share: 'I’m a Golden Retriever type: the comfort station in every friend group.' },
    labrador: { name: 'Labrador', tags: ['Optimistic', 'Active', 'Team Spirit'], summary: 'You tend to act first, then adjust as you go. When a new task appears, your energy often lifts everyone around you. You value teamwork and don’t mind doing a little extra when the moment matters.', flaw: 'When you’re excited, you may agree to too much and only notice the overload later.', share: 'I’m a Labrador type: optimistic, active, and ready to go.' },
    poodle: { name: 'Poodle', tags: ['Smart', 'Sharp', 'Refined'], summary: 'You notice fast, learn fast, and often catch details that others miss. You have your own standards for the environment, expression, and way things are done, and you dislike anything sloppy or half-done.', flaw: 'When your standards are high, you can overthink one small detail for far longer than everyone else.', share: 'I’m a Poodle type: clever, observant, and a bit particular.' },
    'border-collie': { name: 'Border Collie', tags: ['Efficient', 'Focused', 'Strategist'], summary: 'While others are still figuring out where to start, you’ve already quietly organized the steps. You enjoy understanding systems, finding patterns, and turning chaos into something doable.', flaw: 'When you see inefficiency, it’s hard not to mentally rewrite everyone’s workflow.', share: 'I’m a Border Collie type: I naturally turn chaos into a checklist.' },
    'shiba-inu': { name: 'Shiba Inu', tags: ['Independent', 'Reserved', 'Principled'], summary: 'You move at your own pace and keep your boundaries. Around strangers you may take time to warm up, but once you trust someone, your loyalty shows in stable, lasting actions rather than constant fuss.', flaw: 'You may say “it’s fine” while already having one clearly correct answer in your head.', share: 'I’m a Shiba Inu type: not overly eager, but once I’m in, I’m loyal for a long time.' },
    husky: { name: 'Husky', tags: ['Free', 'Adventurous', 'Plot Twist'], summary: 'Your world rarely feels boring because even a normal plan can turn into a whole new side quest in your hands. You’re curious, bold, and dislike being overly constrained by rules.', flaw: 'Your speed occasionally outruns the plan, and only later do you notice the route is a little off.', share: 'I’m a Husky type: free-spirited and self-made drama.' },
    samoyed: { name: 'Samoyed', tags: ['Bright', 'Warm', 'Social Magnet'], summary: 'You know how to bring ease and fun into a room, and you’re comfortable reaching out to others. You may look gentle, but you have clear preferences and you want your feelings and effort to be acknowledged.', flaw: 'You look like you’re always smiling, but you may be quietly waiting for someone to say “you’re amazing today too.”', share: 'I’m a Samoyed type: the one who gets everyone laughing again.' },
    'german-shepherd': { name: 'German Shepherd', tags: ['Reliable', 'Protective', 'Strong Execution'], summary: 'You take commitments seriously and instinctively step in when something needs handling. You may not be the loudest person in the room, but you are often the most reassuring one.', flaw: 'Your sense of responsibility can make you carry tasks that aren’t actually yours.', share: 'I’m a German Shepherd type: I don’t talk much, but I’ll catch the problem and hold it steady.' },
    greyhound: { name: 'Greyhound', tags: ['Quiet', 'Sensitive', 'Relaxed'], summary: 'You’re not short on energy, but you don’t want to waste it on pointless noise. You enjoy comfort, familiarity, and safe spaces, and you’re good at noticing subtle shifts in the atmosphere.', flaw: 'If the sofa is comfortable enough, even the best plan can be postponed by five minutes — then another five.', share: 'I’m a Greyhound type: I sprint when needed, and I lie down when it’s time to rest.' },
    corgi: { name: 'Corgi', tags: ['Lively', 'Opinionated', 'Mini Captain'], summary: 'You have strong presence and can quickly step into a conversation or naturally start organizing the situation. You like being with people, but that doesn’t mean you don’t have your own ideas — in fact, you often know what the group should do next.', flaw: 'You meant to offer one suggestion, and somehow ended up acting as the whole event’s director.', share: 'I’m a Corgi type: small in size, huge in hosting energy.' },
    beagle: { name: 'Beagle', tags: ['Curious', 'Exploratory', 'Interest Navigator'], summary: 'You have almost no defense against a fresh clue. A new question, a store you’ve never visited, or even a random sound on the street can send you off on a new direction. You like to experience things firsthand rather than just hear about them.', flaw: 'You started with one question and somehow ended up with eighteen tabs open.', share: 'I’m a Beagle type: my life runs on curiosity.' },
    'french-bulldog': { name: 'French Bulldog', tags: ['Relaxed', 'Humorous', 'Companion'], summary: 'You are not drawn to busyness or big plans to prove yourself. Comfortable, genuine, and interesting people and things are what deserve your time. You’re very good at defusing awkwardness with ease.', flaw: 'You’re overly sensitive to trouble alarms and will want to sit down and think before anything gets complicated.', share: 'I’m a French Bulldog type: relaxed is not the same as lazy — it’s life wisdom.' },
  },
} satisfies PawMatchMessages;
