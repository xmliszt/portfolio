"use client";

import { useState, useTransition } from "react";

import { CcButton } from "@/app/cc/_ui/cc-button";
import { Panel } from "@/app/cc/_ui/panel";
import { disconnectThreads } from "@/app/cc/(app)/_actions/disconnect-threads";
import { THREADS_REDIRECT_URI } from "@/lib/cc/threads/threads-api";

import type { ThreadsStatus } from "./get-threads-status";

type IntegrationsPanelProps = {
  threads: ThreadsStatus;
  xPosting: boolean;
  blueskyPosting: boolean;
};

export function IntegrationsPanel(props: IntegrationsPanelProps) {
  const [error, setError] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();

  function handleDisconnect() {
    if (!window.confirm("Disconnect Threads?")) return;
    startTransition(async () => {
      try {
        await disconnectThreads();
        setError(undefined);
      } catch {
        setError("Couldn't disconnect. Try again.");
      }
    });
  }

  function renderConnectForm(label: string) {
    return (
      <form action="/api/cc/threads/connect" method="get">
        <CcButton type="submit" variant="primary">
          {label}
        </CcButton>
      </form>
    );
  }

  return (
    <Panel
      title="Integrations"
      aside="Threads sync 10:20 SGT · X, Threads, Bluesky auto-post"
      className="flex-[1_1_100%]"
      bodyClassName="flex flex-col gap-y-3 px-3 py-2.5"
    >
      {(() => {
        switch (props.threads.kind) {
          case "not-set-up":
            return (
              <>
                <p className="text-cc-text-2 leading-relaxed">
                  Threads is not set up.
                </p>
                <ol className="text-muted-foreground flex list-decimal flex-col gap-y-1 pl-5 text-[12px] leading-relaxed">
                  <li>
                    Create a Meta app with the Threads use case and add{" "}
                    <code>{THREADS_REDIRECT_URI}</code> as a redirect callback
                    URL.
                  </li>
                  <li>
                    Give it threads_basic, threads_manage_insights,
                    threads_keyword_search and threads_content_publish.
                  </li>
                  <li>
                    Set <code>CC_THREADS_APP_ID</code> and{" "}
                    <code>CC_THREADS_APP_SECRET</code> in Vercel, redeploy, then
                    connect here.
                  </li>
                </ol>
              </>
            );
          case "not-connected":
            return (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                {renderConnectForm("CONNECT THREADS")}
                <span className="text-muted-foreground text-[12px]">
                  Logs views on your Threads posts, powers “Check tags” in the
                  Composer, and auto-posts scheduled Threads posts.
                </span>
              </div>
            );
          case "expired":
            return (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <span className="flex flex-col gap-y-0.5">
                  <span className="font-bold">
                    Threads · @{props.threads.username ?? "unknown"}
                  </span>
                  <span className="text-cc-warn text-[11px]">
                    Token expired or revoked. Reconnect to resume the sync.
                  </span>
                </span>
                {renderConnectForm("RECONNECT")}
                <CcButton
                  type="button"
                  variant="danger"
                  onClick={handleDisconnect}
                  disabled={isPending}
                >
                  DISCONNECT
                </CcButton>
              </div>
            );
          case "connected":
            return (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <span className="flex flex-col gap-y-0.5">
                  <span className="font-bold">
                    Threads · @{props.threads.username ?? "unknown"}
                  </span>
                  <span className="text-muted-foreground text-[11px]">
                    {props.threads.expiresLabel === undefined
                      ? "Token expiry unknown"
                      : `Token expires ${props.threads.expiresLabel} SGT · refreshed when under 10 days are left`}
                  </span>
                  <span className="text-muted-foreground text-[11px]">
                    Auto-posting needs the threads_content_publish permission.
                    Reconnect once if Threads refuses a post.
                  </span>
                </span>
                {renderConnectForm("RECONNECT")}
                <CcButton
                  type="button"
                  variant="danger"
                  onClick={handleDisconnect}
                  disabled={isPending}
                >
                  DISCONNECT
                </CcButton>
              </div>
            );
          default: {
            const unhandled: never = props.threads;
            return unhandled;
          }
        }
      })()}
      <p className="text-muted-foreground border-t pt-3 text-[12px] leading-relaxed">
        {props.xPosting ? (
          <>
            <span className="text-foreground font-bold">X posting · on.</span>{" "}
            Auto-posts are paid from your X API credits.
          </>
        ) : (
          <>
            <span className="text-foreground font-bold">X posting · off.</span>{" "}
            In the X developer portal, set the app&apos;s user permission to
            Read and write, generate an access token and secret, then set{" "}
            <code>CC_X_API_KEY</code>, <code>CC_X_API_SECRET</code>,{" "}
            <code>CC_X_ACCESS_TOKEN</code> and{" "}
            <code>CC_X_ACCESS_TOKEN_SECRET</code> in Vercel and redeploy.
          </>
        )}
      </p>
      <p className="text-muted-foreground text-[12px] leading-relaxed">
        {props.blueskyPosting ? (
          <>
            <span className="text-foreground font-bold">
              Bluesky posting · on.
            </span>{" "}
            Free; posts as the account in <code>CC_BLUESKY_HANDLE</code>.
          </>
        ) : (
          <>
            <span className="text-foreground font-bold">
              Bluesky posting · off.
            </span>{" "}
            In Bluesky, open Settings → Privacy and security → App passwords,
            create one, then set <code>CC_BLUESKY_HANDLE</code> and{" "}
            <code>CC_BLUESKY_APP_PASSWORD</code> in Vercel and redeploy.
          </>
        )}
      </p>
      {error !== undefined && (
        <span role="alert" className="text-cc-warn text-[11px]">
          {error}
        </span>
      )}
    </Panel>
  );
}
