// The question bank. This file is the game's content; edit it freely.
//
// Each relationship category has five lists, one per depth (Shallows → The deep end).
// A question's identity is its position in its list, and that is what "already asked"
// history remembers. So ADD new questions to the END of a list; inserting or deleting
// in the middle shifts the ones after it and players may see a few repeats.
self.DEEPEND_BANK = {

LEVELS: ["Shallows", "Wading", "Swimming", "Diving", "The deep end"],

// [chip label, question category, how the app refers to them]
GROUPS: [
  { name: "Romantic", rels: [
    ["Partner","romantic","your partner"], ["Boyfriend","romantic","your boyfriend"],
    ["Girlfriend","romantic","your girlfriend"], ["Husband","romantic","your husband"],
    ["Wife","romantic","your wife"], ["Situationship","situationship","your situationship"],
    ["A date","dating","a date"]
  ]},
  { name: "Friends", rels: [
    ["Friend","friend","a friend"], ["Best friend","friend","your best friend"],
    ["Roommate","friend","your roommate"]
  ]},
  { name: "Family", rels: [
    ["Brother","family","your brother"], ["Sister","family","your sister"],
    ["Parent","family","your parent"], ["Cousin","family","your cousin"]
  ]},
  { name: "Work", rels: [
    ["Coworker","coworker","a coworker"], ["Boss","coworker","your boss"]
  ]}
],

Q: {
romantic:[
 ["What's a song that instantly puts you in a good mood?","If we had a free Saturday with zero plans, how would you spend it?","What's the weirdest food combo you secretly love?","Which of my habits do you find oddly cute?","What's a trip we should take that we've never talked about?","What's your go-to order when you can't decide?","If we had a theme song as a couple, what would it be?","What's the best gift you've ever received?"],
 ["What did you think of me the first time we met?","What's a small thing I do that makes your day better?","What's a tradition you'd like us to start?","When did you first realize you really liked me?","What's one moment from your childhood you wish I'd been there for?","What's your favorite memory of us from this past year?","What's something new you'd like us to try together?","What's a date of ours you'd happily relive?"],
 ["What's something you're working on in yourself right now?","When do you feel most loved by me?","What's a dream you've quietly kept to yourself?","What did your family teach you about love, good or bad?","What should I understand better about how you handle stress?","When have you felt really proud of us?","What does a perfect ordinary day together look like to you?","What's something you've changed your mind about since we met?"],
 ["What's a fear you have about our future together?","Is there something you've wanted to ask me but haven't?","When have you felt alone, even with me around?","What's a part of yourself you're still learning to accept?","What do you need more of from me right now?","What's a hurt from your past that still shows up in how you love?","What's something you worry I'd think less of you for?","When do you find it hardest to let me in?"],
 ["What's something you've never felt safe telling me?","What do you think we avoid talking about, and why?","If this ended tomorrow, what would you regret not saying?","What's the hardest thing about letting me fully see you?","When have I hurt you without knowing it?","What do you hope I understand about you that I don't yet?","What's a promise you'd want us to make to each other?","What do you need to hear from me that I haven't said?"]
],
situationship:[
 ["What's your go-to excuse for texting me at midnight?","What's a song that sums up whatever this is?","If we had a couple name, what would it be?","What's the most unhinged thing you've done after 1am?","Which of my Instagram stories do you pretend not to see?","Rate how good I am at picking restaurants, 1 to 10.","What's your most chaotic dating app story?","What's a hill you'd die on that I'd hate?"],
 ["What did you actually think of me the first time we hung out?","What's your favorite thing we've done together so far?","Who's the friend who knows the most about us?","What's something I do that you secretly like?","What's your ideal low-effort night with me?","What's something about me that surprised you?","Do you tell people about me, and what do you call me?","What's a moment you thought, okay, I like this person?"],
 ["What made you want to keep this casual?","What does being exclusive mean to you?","How do you usually know when you're catching feelings?","What's the longest you've stayed in a situationship?","What do you think we're good at together?","What's something you're looking for right now that you haven't said?","What's your honest read on how things are going between us?","How do you feel when we go a few days without talking?"],
 ["Have you been holding back from me on purpose?","What scares you about labeling this?","When have you felt unsure where you stand with me?","What would make you want more from this?","What's a past relationship that still makes you cautious?","Is there something you've wanted to ask me but played it cool instead?","What do you want me to stop pretending not to notice?","What's one thing you'd need from me to feel secure?"],
 ["So honestly, what are we?","Where do you see this in six months?","What would you feel if I started seeing someone else?","What are you most afraid I'll say if we talk about this seriously?","What's something you've felt about us that you never said?","If this ended tomorrow, what would you wish you'd told me?","What would it take for you to go all in?","Do you want this to be more? Why or why not?"]
],
dating:[
 ["What's the best thing you've eaten this month?","What would your perfect Sunday look like?","What hobby would you pick up if time and money didn't matter?","Beach, mountains, or city, and why?","What's a show you could rewatch forever?","What's the most spontaneous thing you've done lately?","What's your most controversial food opinion?","What's a skill you'd love to be instantly great at?"],
 ["What do people usually get wrong about you at first?","What were you like as a kid?","What's a green flag you look for in people?","What's something you're weirdly passionate about?","Who in your life do you admire most?","What's a small win you had recently?","What's the best advice you've ever gotten?","What does your ideal weekend with someone look like?"],
 ["What's a turning point that changed the direction of your life?","What does a good relationship look like to you?","What are you proud of that you don't talk about much?","What makes you feel really understood?","What's a lesson a past relationship taught you?","What are you looking for right now, honestly?","What's something you're trying to get better at?","How do you like to be cared for when you're having a bad day?"],
 ["What's something you're still healing from?","What's a fear that holds you back sometimes?","When do you feel most like yourself, and when least?","What's a belief you've changed your mind about?","What's hard for you to ask for?","What part of you takes a while for people to see?","What's something you're insecure about that you'd never guess?","What's a pattern you're trying to break?"],
 ["What do you hope the right person understands about you?","What's the bravest thing you've ever done emotionally?","What's a wall you put up, and what would it take to lower it?","What do you deserve in love that you haven't had yet?","What's a loss that shaped who you are?","What's something you've never said out loud to anyone?","What would you want someone to know before falling for you?","When did you last cry, and why?"]
],
friend:[
 ["What's your most-used emoji and what does it say about you?","What's the best thing you've bought for under $20?","If we started a business together, what would it be?","What's a movie you think is underrated?","What's the funniest thing that's happened to you lately?","What would your entrance song be?","If we swapped lives for a day, what would you do first?","What's your most useless talent?"],
 ["What's your favorite memory of us?","What are you looking forward to this year?","What did you think of me when we first met?","What's a hobby you've always wanted to try?","Which friend in the group are you, honestly?","What's a compliment you still remember?","What's an adventure we should go on together?","Who's someone that made a big difference in your life?"],
 ["What's been weighing on you lately?","What's something you've learned about yourself this year?","What do you value most in a friendship?","What's a goal you haven't told many people about?","When did you need a friend and not ask?","What are you proud of that nobody celebrated?","What's changed most about you in the last few years?","What does a good day look like for you right now?"],
 ["Is there a time I let you down that we never talked about?","What are you struggling with that you hide well?","What's a fear you have about the next five years?","Who do you miss that you don't talk to anymore?","What do you wish people asked you about?","How can I be a better friend to you?","What's something you're afraid to admit you want?","When do you feel most on your own?"],
 ["What's something you've never told anyone that you'd tell me?","When have you felt most lost?","What's a part of your life you feel ashamed of, and shouldn't?","What would you want me to know if we ever drifted apart?","What do you need from me that you've never asked for?","What's the loneliest you've ever felt?","What's something about you that you hope never changes?","What's a regret you still think about?"]
],
family:[
 ["What family meal would you request for your last supper?","Which relative would survive longest in a zombie movie?","What's the best family trip we ever took?","What's a toy or game from childhood you still think about?","What family saying or inside joke do you love?","Who in the family has the worst taste in music?","What's the most chaotic holiday you remember?","Which family recipe should never be lost?"],
 ["What's a favorite memory of the two of us?","What family tradition should we keep going forever?","What do you admire about me that you've never said?","Which relative do you think you're most like?","What were you like at sixteen?","What's a family story you think I don't know?","What's something you'd love us to do together this year?","Who in the family made you laugh the most growing up?"],
 ["What did our family do really well?","What from growing up shaped you more than people realize?","How do you think I've changed over the years?","What's a family rule you now understand, or still disagree with?","What are you proud of that the family never noticed?","What do you wish we did more of together?","What's something you learned from your parents without them saying it?","What part of our family do you want to pass on?"],
 ["Is there something from growing up you wish had gone differently?","What have you always wanted to ask me?","How did our family handle things in a way that still affects you?","When did you feel misunderstood by the family?","What's something you worry about for me?","What do you wish you'd heard more of growing up?","What's a family expectation you've struggled with?","When did you feel closest to leaving the family's way of doing things behind?"],
 ["Is there anything you want to forgive me for, or be forgiven for?","What do you hope I'll remember about you someday?","What have you carried about our family that you've never said out loud?","When have you felt closest to me, and when furthest?","What do you wish I truly knew about your life?","If we could have one honest conversation about the past, what would it be about?","What do you need from me that you've never asked for?","What would you want to say to me if you knew it was the last chance?"]
],
coworker:[
 ["What's your go-to lunch order?","What was your first ever job?","What's the most useful app on your phone?","Coffee, tea, or pure willpower?","What are you great at that has nothing to do with work?","What's the best trip you've taken?","What's your ideal day off?","What's a small thing that always makes your workday better?"],
 ["What made you choose this line of work?","What's the best advice a boss ever gave you?","What skill would you love to learn this year?","What does your ideal workday look like?","What would you be doing if not this job?","What's a work win you're proud of lately?","Who taught you the most early in your career?","What's something about you most people here don't know?"],
 ["What part of your job do most people not see?","What keeps you going when work gets tough?","What's a mistake that taught you a lot?","Where do you want to be in five years?","What kind of feedback helps you most?","What do you wish the team knew about you?","What does a great team feel like to you?","What would make your work feel easier right now?"],
 ["What part of work drains you most?","When have you felt out of your depth at work?","What would you change about how we work together?","What's hardest about balancing work and life for you?","What's a career fear you don't talk about?","What's something you're quietly proud of outside work?","When did you last feel really stuck?","What would you do differently if you started your career over?"],
 ["What does success actually mean to you, beyond titles?","What moment at work really shook your confidence?","What do you need at work that you've been afraid to ask for?","If you left one lesson for whoever replaces you someday, what would it be?","What personal challenge shaped how you show up at work?","What would make this job feel truly meaningful to you?","When have you felt most seen at work?","What's something you've sacrificed for your career?"]
]
}
};
