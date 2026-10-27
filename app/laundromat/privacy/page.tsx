import { LegalPage } from "@/app/laundromat/legal/legal-page";
import { LegalSection } from "@/app/laundromat/legal/legal-section";
import { getLegalPageMetadata } from "@/lib/laundromat/legal/get-legal-page-metadata";
import { LEGAL_CONTACT_EMAIL } from "@/lib/laundromat/legal/legal-contact-email";
import { LEGAL_PAGES } from "@/lib/laundromat/legal/legal-pages";

const DESCRIPTION =
  "What laundro.cafe keeps, where it goes, and what you can do about it.";

export const metadata = getLegalPageMetadata({
  ...LEGAL_PAGES.privacy,
  description: DESCRIPTION,
});

export default function LaundromatPrivacyPage() {
  return (
    <LegalPage
      page="privacy"
      intro="laundro.cafe is a small shared laundromat on the web. It is made and run by Li Yuxuan, an individual in Singapore. There are no accounts and no ads. This page lists what the site keeps, where it goes, and what you can do about it."
    >
      <LegalSection heading="what stays in your browser">
        <p>
          The site saves a few things in your browser&apos;s local storage, so
          they are still there when you come back:
        </p>
        <ul>
          <li>a random visitor id, made in your browser</li>
          <li>your laundry and its timers</li>
          <li>
            your sound, TV, rendering and weather settings, including a city you
            pick
          </li>
          <li>notebook text and doodles you have started but not saved</li>
          <li>when you last wrote in the notebook</li>
          <li>
            whether you have been here before, and whether you opened the toy
            box
          </li>
          <li>the Mastodon server you last shared a photo to</li>
        </ul>
        <p>
          These stay on your device, except where a section below says
          otherwise. To remove them, clear the site data for laundro.cafe in
          your browser.
        </p>
      </LegalSection>

      <LegalSection heading="cookies">
        <p>The site sets two cookies.</p>
        <ul>
          <li>
            <code>laundromat-locale</code> remembers the language you pick. It
            lasts one year.
          </li>
          <li>
            <code>laundromat_visitor</code> is set the first time you open the
            site. It holds a random id signed by the server, used to count your
            visits, limit how often one visitor writes in the notebook and count
            each report once. Scripts on the page cannot read it. It lasts one
            year.
          </li>
        </ul>
        <p>
          There are no advertising cookies, and no cookies from other sites.
        </p>
      </LegalSection>

      <LegalSection heading="sharing the room">
        <p>
          While you are in the room, your browser joins a live channel so
          visitors can see each other. Everyone else in the room receives:
        </p>
        <ul>
          <li>a random id for your tab, and your random visitor id</li>
          <li>your rough region (see below)</li>
          <li>what your machine is doing and when its cycle ends</li>
          <li>
            the shared coffee pot, and which visitor id started brewing it
          </li>
          <li>your clock reading, so timers line up</li>
          <li>whether you are writing in the notebook</li>
          <li>
            <strong>
              what you type or draw in the notebook, live, before you save it
            </strong>
          </li>
        </ul>
        <p>
          This live data passes through Supabase Realtime. The site does not
          store it.
        </p>
      </LegalSection>

      <LegalSection heading="your location">
        <p>
          The site never asks for your device&apos;s location. Vercel, which
          hosts the site, estimates a location from your IP address. The site
          uses it in two ways:
        </p>
        <ul>
          <li>
            <strong>In the room</strong>, it is rounded to whole degrees of
            latitude and longitude, about 100 km. Other visitors receive it, so
            people near each other can share a pot of coffee.
          </li>
          <li>
            <strong>For the weather</strong>, it is rounded to one decimal
            place, about 10 km. The server sends that to Open-Meteo for the
            local weather and air quality. Your IP address is not sent to
            Open-Meteo. Your city name is shown back to you, and your country
            picks Celsius or Fahrenheit.
          </li>
        </ul>
        <p>
          If you pick a city in settings, the site uses that city instead. City
          searches also go through the server to Open-Meteo.
        </p>
      </LegalSection>

      <LegalSection heading="the shared notebook">
        <p>
          Notebook entries are public. Anyone who visits can read them. When you
          save an entry or a doodle, the site stores it in its Supabase database
          with its handwriting style, its place in the notebook and the time.
        </p>
        <p>
          It also stores which visitor id (from the{" "}
          <code>laundromat_visitor</code> cookie) wrote each entry, to limit how
          often one visitor writes. That id is never shown to others.
        </p>
        <p>
          When you report an entry, the site stores which entry, your visitor id
          and the reason you give, if any. Reported entries may be hidden.
        </p>
        <p>
          Entries are kept as long as the notebook is. To have your entry
          removed, email me with the notebook number, the page and roughly when
          you wrote it.
        </p>
      </LegalSection>

      <LegalSection heading="notifications">
        <p>
          If you allow notifications, your browser tells you when your laundry
          is done, or when the notebook is free if you asked to be told. The
          page makes these notes itself. No push service is used and nothing is
          sent to me.
        </p>
      </LegalSection>

      <LegalSection heading="photos">
        <p>
          The instant camera makes its photos in your browser. Saving or copying
          a photo keeps it on your device. Sharing hands the photo, a short text
          and a link to the app or site you pick, through your device&apos;s
          share menu or your clipboard. The site does not upload your photos.
        </p>
      </LegalSection>

      <LegalSection heading="the TV">
        <p>
          The TV plays YouTube live streams. Station pictures load from
          YouTube&apos;s image server when you visit. When you turn the TV on
          with sound, a YouTube player loads, and YouTube may set its own
          cookies. See{" "}
          <a
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noopener"
          >
            Google&apos;s privacy policy
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection heading="visit counts and server logs">
        <p>
          Vercel Web Analytics counts page views: the page, where you came from,
          your browser, device type and country. It uses no cookies. Vercel also
          keeps short-lived request logs that include IP addresses. See{" "}
          <a
            href="https://vercel.com/legal/privacy-policy"
            target="_blank"
            rel="noopener"
          >
            Vercel&apos;s privacy policy
          </a>
          .
        </p>
        <p>
          The site also counts visits itself. Once a day per visitor, it stores
          your visitor id from the <code>laundromat_visitor</code> cookie, the
          date, the times of your first and last visit that day, how many times
          you opened the site, the language you opened it in, your country and
          the website you came from. Visits counted under the random visitor id
          from local storage move to the cookie id the next time you visit. It
          does not store your IP address or the full address of the page you
          came from.
        </p>
        <p>Fonts are served from laundro.cafe itself.</p>
      </LegalSection>

      <LegalSection heading="tips">
        <p>
          You can leave a tip at the coin machine. Tips are processed by Stripe.
          laundro.cafe never sees your card or bank details. Stripe asks for
          your email address to send a receipt, and handles payment data under{" "}
          <a href="https://stripe.com/privacy" target="_blank" rel="noopener">
            its own privacy policy
          </a>
          .
        </p>
        <p>For each tip, the site stores:</p>
        <ul>
          <li>the coin number</li>
          <li>the amount</li>
          <li>the date</li>
          <li>the Stripe Checkout session id</li>
          <li>the email address you gave Stripe</li>
          <li>a one-way hash of your token code</li>
          <li>when and in which machine the token was used</li>
        </ul>
        <p>
          The email address is kept so I can help you if you lose your token,
          and is never shown to anyone or used for anything else. The token code
          is saved in your browser and printed on your Stripe receipt with a
          link to restore it; the site itself stores only its hash. The tip jar
          shows other visitors only coin numbers and dates.
        </p>
      </LegalSection>

      <LegalSection heading="who receives data">
        <ul>
          <li>Vercel: hosting, IP location, page view counts</li>
          <li>
            Supabase: the notebook database, visit counts and the live room
          </li>
          <li>
            Open-Meteo: rounded coordinates and city searches, for weather
          </li>
          <li>YouTube: station pictures, and the TV stream when it is on</li>
          <li>Stripe: tip payments</li>
        </ul>
        <p>I do not sell your data or use it for ads.</p>
      </LegalSection>

      <LegalSection heading="your choices">
        <ul>
          <li>Clear the site data in your browser to remove what it saved.</li>
          <li>Leave notifications off, or turn them off in your browser.</li>
          <li>Keep the TV off to stop the YouTube player from loading.</li>
          <li>
            Email{" "}
            <a href={`mailto:${LEGAL_CONTACT_EMAIL}`}>{LEGAL_CONTACT_EMAIL}</a>{" "}
            to ask what is stored about you, or to have a notebook entry, tip
            record or visit records removed.
          </li>
        </ul>
      </LegalSection>

      <LegalSection heading="changes">
        <p>
          If this policy changes, I will update this page and its effective
          date.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
