# CC user guide

CC (https://cc.liyuxuan.dev) is a private dashboard for planning, posting and tracking social posts for one owner. This guide is for an agent that drives CC through its web UI on the owner's behalf. It covers every screen, what each control does, which states disable it, and the rules that keep posts from going out twice or at the wrong time.

All times in CC are Singapore time (SGT, UTC+8) unless a label says ET or PT.

## Ground rules for an agent

1. **Save before anything else.** The Composer shows `● UNSAVED` while edits are pending. CREATE FORK, AUTO-POST and POST NOW VIA API are disabled until you press **SAVE ⌘S**. Auto-post and fork use the saved text, never the unsaved text.
2. **Never post the same content twice.** Each platform's repost rule is under "Reposting" below. Fork a post and change its first line instead of reusing text as is.
3. **Do not upload media you cannot see.** Reuse media by forking a post that already has it.
4. **Ask the owner before you delete a post, post now, or turn on auto-post for something they have not approved.** These actions publish or remove content.
5. **Read the error line.** Every action that fails shows the reason in orange under the control. Report it to the owner word for word.

## Navigation

The left rail has seven sections:

| Section     | Path        | Use it to                                                                            |
| ----------- | ----------- | ------------------------------------------------------------------------------------ |
| OVERVIEW    | `/`         | See what is due now, the run sheet and the campaign's numbers                        |
| CALENDAR    | `/calendar` | See the week, move or skip a slot                                                    |
| COMPOSER    | `/composer` | Write and check a post, attach media, fork, schedule, auto-post, delete              |
| LOG NUMBERS | `/log`      | Type in each post's numbers at +1 h, +24 h and +7 d                                  |
| INSIGHTS    | `/insights` | Compare platforms, targets, hashtags, posting hours, keywords                        |
| NEW         | `/new`      | Schedule a post, create a campaign, start a smart campaign, run the schedule planner |
| SETTINGS    | `/settings` | Theme, integrations, edit the current campaign                                       |

The rail footer has the theme switch: **AUTO** (light 07:00–19:00 SGT, dark otherwise), **LIGHT** or **DARK**. An orange ● on SETTINGS means Threads needs connecting.

CC always shows the **current campaign**: the one with the newest start date.

## Concepts

- **Campaign:** a launch or push with a name, product link, start date and notes. Every post belongs to one.
- **Post:** one item on one platform. Its `kind` is one of:
  - `post`: a main post.
  - `reply`: a reply under a main post, for example "Reply 1: the link" on X.
  - `comment`: a first comment, for example on LinkedIn, Product Hunt or 朋友圈.
  - `repost`: posting an earlier post's idea again, linked to that original.
- **Status:**
  - `draft`: no reminders.
  - `scheduled`: has a time and a "post" reminder.
  - `posted`: live.
  - `skipped`: dropped.
- **Variant:** `mine` (the owner's text) or `chatgpt` (an A/B version written with ChatGPT).
- **Target:**
  - Reddit: the subreddit (`r/Name`).
  - Threads: the topic (`topic_tag`).
  - X: the community id or link (optional).
- **Wave:** the order the schedule planner places main posts in: wave 1 first, then 2, 3, 4, then posts with no wave. A smart campaign sets it (SET); otherwise it comes from the media (FROM MEDIA): a video with "promo" in its name is wave 1, another video wave 2, images only wave 3, no media last. The Composer shows it read-only; click it to open the post's slot in the calendar.

## Platforms

| Platform     | Auto-post      | Text limit                    | Logged numbers                                                                                      |
| ------------ | -------------- | ----------------------------- | --------------------------------------------------------------------------------------------------- |
| X            | Yes            | 280 (links count 23, emoji 2) | impressions, likes, replies, reposts, profile visits                                                |
| Threads      | Yes            | 500                           | views, likes, replies, shares, reposts, quotes (synced daily)                                       |
| Bluesky      | Yes            | 300                           | likes, replies, reposts, quotes                                                                     |
| Instagram    | No, from phone | 2200                          | views, likes, comments, shares, saves, viewers, follows                                             |
| TikTok       | No, from phone | 2200                          | views, likes, comments, shares, favorites, viewers, new followers                                   |
| Reddit       | No             | title 300                     | views, upvotes, comments, shares                                                                    |
| 小红书       | No, from phone | title 20, text 1000           | 观看, 点赞, 收藏, 评论, 分享, 涨粉                                                                  |
| 视频号       | No, from phone | 1000                          | 播放, 点赞, 评论, 转发, 收藏                                                                        |
| 朋友圈       | No, from phone | —                             | 点赞, 评论                                                                                          |
| YouTube      | No             | title 100                     | views, likes, comments, shares, subscribers                                                         |
| LinkedIn     | No             | 3000                          | impressions, likes as reactions, comments, shares as sends, saves, members reached, reposts         |
| Product Hunt | No             | tagline 60, text 260          | upvotes, comments, rank                                                                             |

For platforms without auto-post, the owner posts by hand: CC copies the text and opens the platform's composer. Then the post is marked posted with its live link.

## OVERVIEW

- **DUE NOW:** reminders that are due, the same ones Telegram sends. These are posts to publish, replies to answer and numbers to log.
- **Run sheet:** today's posts, one row each: time, platform, name (click it to open the Composer), status, **COPY**, **OPEN ↗** and **MARK POSTED**. The open posts' buttons are highlighted.
- **VOICE CHECK · QUEUE:** flags text that breaks the owner's voice rules.

## CALENDAR

- The week grid shows each post as `HH:MM PLATFORM` plus its name. Skipped posts are struck through.
- **+ SCHEDULE POST** (top right) opens the schedule form on NEW, set to the week and heat platform on screen.
- Click a post to open **EDIT SLOT**:
  - DATE (SGT) and TIME (SGT), then **RESCHEDULE**. Its replies move by the same amount.
  - **SKIP:** drops the post and its unposted replies.
  - **DELETE POST:** see "Deleting".
  - "Edit text in composer →".
- **HEAT OVERLAY** (a dropdown above the grid) shades the hours that worked best for one platform.

## NEW

- **SCHEDULE POST** (form): PLATFORM, SAVE AS (`Scheduled (reminders on)` or `Draft (no reminders)`), the target field if the platform has one, TITLE, DATE, TIME. **SUGGEST** fills the best open slot. A clash warning appears when the time is too close to another post. Then press **+ SCHEDULE POST** and follow "Write the text in the composer →".
- **New campaign:** NAME, LINK, STARTS (SGT) and the maker's note, then **CREATE CAMPAIGN**. The new campaign becomes the current one.
- **Smart campaign:** **START SMART CAMPAIGN →** opens `/campaigns/new` (see "Smart campaign").
- **Schedule planner:** set MAX POSTS PER DAY and MIN GAP (MINUTES), then press **PLAN SCHEDULE**. It previews CURRENT → PROPOSED times; press **APPLY** to move the posts. Pinned platforms (Product Hunt, YouTube) never move.

## SETTINGS

- **Appearance:** AUTO, LIGHT or DARK, the same switch as the rail footer.
- **Integrations:** shows what is connected.
  - Threads: the token, plus RECONNECT and DISCONNECT.
  - X posting: on or off.
  - Bluesky posting: on or off.
    If a platform shows off, the owner has to add keys in Vercel. An agent cannot fix this.
- **Current campaign:** edit the name, link, start date (SGT) and notes, then **SAVE CAMPAIGN**.

## COMPOSER

The Composer edits one main post at a time, with its replies and comments under it. A URL like `/composer?post=<id>` opens that post.

The page has three columns:

1. **POSTS** (left): every main post in the campaign in time order, grouped by SGT day. Each row shows the time, the platform, a status (POSTED, AUTO, MANUAL, DRAFT, FAILED, SKIPPED) and the name. Click a row to open it.
2. **The post** (middle): its fields, then its replies as a numbered thread, then the **action bar** pinned to the bottom.
3. **Checks** (right): tabs for **PRE-FLIGHT**, **VOICE**, **CHATGPT** and, on X and Threads, **TAGS**. The PRE-FLIGHT tab shows how many checks need fixing.

**The action bar** (bottom of the middle column) shows SAVED ✓ / ● UNSAVED and the scheduled time, then the actions:

- **SAVE ⌘S**
- **SCHEDULE ▾**: date and time
- **COPY TEXT**
- **OPEN … ↗** or **COPY + OPEN … ↗**
- **MARK POSTED**
- **MORE ▾**: fork and delete

On X, Threads and Bluesky, a second row holds **PUBLISH AS** (on reposts) and the auto-post controls.

### Writing

- **Fields**, top to bottom: TITLE (where the platform has one), TEXT, HASHTAGS and LINK, the target field (subreddit, topic or X community) and PLANNER WAVE, then ASSETS.
- The character counter turns red over the limit.
- **PRE-FLIGHT** (Checks column) lists computed checks (✓ or "Needs a look") and manual checks to tick.
- **TAGS** (Checks column, X and Threads) shows recent use of the hashtags.
- **CHATGPT** (Checks column) opens ChatGPT with a prompt. Paste its version back, then save it as a `chatgpt` A/B variant with **SAVE · KEEP BOTH (A/B)**.
- **SAVE ⌘S** (action bar) saves every edited post on the page.

### Media

- Upload files with **↑ UPLOAD FILES** and give each one alt text (COPY ALT copies it). Videos preview large enough to play with native controls. On a reply, media sits under **+ MEDIA**.
- Auto-post needs uploaded files of these types: JPG, PNG, WebP, GIF, MP4, MOV.
  - **X:** up to 4 images, or 1 video or GIF on its own.
  - **Threads:** up to 20 images or videos (a carousel when there is more than one). No GIF.
  - **Bluesky:** up to 4 images of 2 MB each, or 1 MP4 on its own. No GIF or MOV.
- To reuse a video without uploading it again, fork the post (**MORE ▾ → CREATE FORK**).

### Posting by hand

- **COPY TEXT**, then **OPEN … ↗** (prefilled) or **COPY + OPEN … ↗**, in the action bar.
- Phone platforms show **POST FROM PHONE** and the list of assets.
- After posting, press **MARK POSTED**, paste the live link, and confirm. This starts the reply and log reminders from that moment.

### Scheduling

Any post that is not posted has **SCHEDULE ▾** in the action bar. It opens **DATE (SGT)**, **TIME (SGT)** and a **SCHEDULE** or **RESCHEDULE** button. This works for drafts with no time too; they don't appear on the calendar until they have one. Replies move with the post.

### Auto-posting (X, Threads, Bluesky)

**Main posts and reposts:**

- **AUTO-POST AT SCHEDULED TIME** is enabled only when the post is saved, scheduled, and at least 1 minute in the future.
- Turning it on checks the platform setup, the text length, the media, and Bluesky image sizes. If the post would fail, it refuses with the reason.
- While it is on, the label reads `AUTO-POSTS <time> SGT ✓`, with **TURN OFF** next to it.
- CC posts within a minute of the time.
- The owner gets a Telegram message: `✅ Auto-posted` with the link, or `⚠️ Auto-post failed` with the reason and a compose link.
- The −10 min "post now" Telegram reminder is not sent while auto-post is on. It comes back if auto-post is turned off.

**POST NOW VIA API** posts immediately through the API, after a confirm. Ask the owner first.

**States:**

| Label                              | Meaning              | What to do                                                                                                                                             |
| ---------------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `AUTO-POSTING ON <PLATFORM>…`      | CC is posting it now | Wait; all changes are refused meanwhile                                                                                                                |
| `AUTO-POST FAILED` plus the reason | It did not post      | Read the reason. If it says "may or may not be live", check the platform before posting again. Then **POST NOW VIA API**, **TURN OFF**, or reschedule. |

Rescheduling a failed post clears the failure and turns auto-post off, so it has to be turned on again.

**Limits:**

- CC skips a post more than 30 minutes late (for example, if the server was down) and marks it failed instead of posting it late.
- A post on X with a link costs about $0.20 on the owner's X credits; without a link, about $0.015. Threads and Bluesky are free.

**Replies and comments** (X, Threads, Bluesky): each reply has its own auto-post control.

- **AUTO-POST AFTER PARENT** needs the parent post to have auto-post on, or to be live already with the reply at most 30 minutes past its time. If the parent's auto-post fails, its replies are marked failed, then re-armed automatically once the parent goes live through CC.
- A reply goes out at the parent's actual posting time plus the planned gap.
- Each reply answers the latest earlier reply that is live, so replies read as a thread.
- If the parent was marked posted by hand without a time, the gap is 0 and the reply is due at once. Use **POST NOW VIA API** for it.

**X community:** put the community id, or its `x.com/i/communities/<id>` link, in the X post's community field.

### Forking (reuse a post)

**MORE ▾** in the action bar opens the fork form: PLATFORM, DATE (SGT) and TIME (SGT). Leave both date and time empty to save a draft. Then press **CREATE FORK**.

- The fork copies the saved text, hashtags, link, title and uploaded media, then opens the new post.
- **Fork a posted post on the same platform:** the fork is saved as its **repost**.
- **Fork onto another platform, or from an unposted post:** the fork is saved as a **new post**.
- **One repost per post:**
  - If a repost already exists and is posted or waiting, CC refuses and shows **Open it →**. Fork or edit that repost instead.
  - A skipped repost is replaced by the fork.
- An unposted repost cannot be forked on its own platform. Edit it instead.
- Replies are not copied.

### Deleting

**DELETE POST** is in the Composer (**MORE ▾**) and in EDIT SLOT, and asks for confirmation.

- It removes the post from CC along with its ChatGPT version, replies, unposted reposts, reminders and logged numbers.
- A live post stays up on the platform; delete it there separately.
- It is refused while CC is auto-posting the post or one of its replies, and when a repost of it is live.

## Reposting (posting an idea again)

| Platform                              | How                                                                                              | Wait at least |
| ------------------------------------- | ------------------------------------------------------------------------------------------------ | ------------- |
| X                                     | Quote your own post with a new first line, or a new post on the same idea. Never identical text. | 7 days        |
| Threads                               | A new post with a new first line and, ideally, a different image or clip                         | 14 days       |
| Bluesky                               | Quote your own post with a new first line, or a new post                                         | 7 days        |
| Instagram                             | Re-cut: new cover, new first line, or another clip                                               | 30 days       |
| TikTok                                | A new edit with a new hook in the first second                                                   | 14 days       |
| LinkedIn                              | Same idea with a new opening line                                                                | 60–90 days    |
| Reddit, Product Hunt, 朋友圈, YouTube | Never repost                                                                                     | —             |

**PUBLISH AS** (Composer, on an unposted repost on X, Threads or Bluesky) sets how the repost goes out:

- **New post:** its own text, as a new post.
- **Quote the original:** its text with the original embedded. On X the API quotes only on Enterprise, so CC adds the original's link to the text; X shows a quote card, and the link makes the post cost about $0.20.
- **Plain repost:** reposts the original as it is. The text and media are not used, and no numbers are logged.

Changing PUBLISH AS turns auto-post off; turn it on again to recheck. The original must be live.

Follow-ups never introduce the product again. A daily rules job suggests reposts for posts that did well and sends them on Telegram.

## LOG NUMBERS

- **QUICK ENTRY** lists each post due for numbers at +1 h, +24 h or +7 d after it was marked posted. Below each row, **OR PASTE A LINE** takes all the numbers at once. **EXTRA ENTRY FOR** adds a row for any posted post. **REPLY ON TELEGRAM INSTEAD** (collapsed) shows the Telegram format.
- Type the numbers in the platform's own fields and press Enter to save. Tab moves between fields.
- The same numbers can be sent as one Telegram reply to a "📊 Log numbers" message, in the order the message lists, separated by spaces. Use `-` to skip one. `1.2k`, `1,240` and `1.2万` are accepted. Send `undo` to remove the last entry.
- Threads numbers are synced automatically each day for main posts.
- Do not invent numbers. Only log what the platform's insights screen shows.

## INSIGHTS

These panels read the logged numbers:

- By platform.
- By subreddit, topic or community.
- Hashtags (your posts only).
- Cumulative views.
- Your views by posting hour.
- A/B pairs (mine vs ChatGPT).
- Learnings.
- Keywords (X posts per day for tracked terms).

## Smart campaign

Path: `/campaigns/new`.

1. Fill in PRODUCT NAME, PRODUCT LINK, KIND, EVENT DAY (SGT), LENGTH (DAYS) and the platforms.
2. CC builds a prompt for ChatGPT. Copy it with **COPY PROMPT**, get ChatGPT's reply, and paste it into "ChatGPT's reply".
3. Check the draft cards, enter CAMPAIGN NAME, then **CREATE CAMPAIGN · N POSTS**.
4. Posts start as drafts. Press **PLAN SCHEDULE**, then **APPLY**, to schedule them.

## Telegram

The owner's bot sends:

- `⏰ Post now`, 10 minutes before each manual post.
- `💬 Reply to comments`, 30 minutes after posting.
- `📊 Log numbers`, at +1 h, +24 h and +7 d.
- Repost suggestions from the rules job.
- Auto-post results.

Buttons open the Composer or the platform. **Skip** on a suggestion skips that post.

## Typical tasks

**Schedule a new X post for Thursday 21:00 with auto-post:**

1. NEW → SCHEDULE POST: PLATFORM X, SAVE AS Scheduled, TITLE, DATE, TIME 21:00 → + SCHEDULE POST.
2. Open it in the Composer, write the text, upload media with alt text, then SAVE.
3. Check PRE-FLIGHT.
4. Press AUTO-POST AT SCHEDULED TIME and confirm the label reads `AUTO-POSTS … ✓`.

**Repost last week's Threads post with a new first line and the same video:**

1. Open the original in the Composer → **MORE ▾** (fork).
2. Keep PLATFORM Threads, set DATE and TIME → CREATE FORK.
3. Change the first line, SAVE, then turn on auto-post.

**Reuse an X video on Bluesky:**

1. Open the X post → **MORE ▾** (fork).
2. PLATFORM Bluesky, set DATE and TIME → CREATE FORK.
3. Trim the text to 300 characters. Make sure the video is an MP4. SAVE, then auto-post.

**A subreddit removed a post:**

1. Ask the owner.
2. Then Composer or EDIT SLOT → DELETE POST.

**A post went out by hand:**

- MARK POSTED with the live link.

**A post moved to another time:**

- Composer → DATE/TIME → RESCHEDULE, or Calendar → EDIT SLOT → RESCHEDULE.
