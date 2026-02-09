import { Children, isValidElement } from "react";
import * as runtime from "react/jsx-runtime";
import Link from "next/link";

import { slugify } from "@/lib/utils";

import { BackToTopLink } from "./ui/back-to-top-link";
import { BadgeGroup } from "./ui/badge-group";
import { BookGrid } from "./ui/book-grid";
import { CopyablePre } from "./ui/copyable-pre";
import { CustomLink } from "./ui/custom-link";
import { ExternalActionButtonLink } from "./ui/external-action-button-link";
import { FilmGrid } from "./ui/film-grid";
import { ImagePerspectiveLink } from "./ui/image-perspective-link";
import { LoadMoreLinks } from "./ui/load-more-links";
import { PhotoBentoGrid } from "./ui/photo-bento-grid";
import { Ratings } from "./ui/ratings";

interface MdxProps {
  code: string;
  components?: Record<string, React.ComponentType>;
}

const useMDXComponent = (code: string) => {
  const fn = new Function(code);
  return fn({ ...runtime }).default;
};

const getHeadingText = (children: React.ReactNode): string => {
  return Children.toArray(children)
    .map((child) => {
      if (typeof child === "string" || typeof child === "number") {
        return String(child);
      }

      if (isValidElement<{ children?: React.ReactNode }>(child)) {
        if (child.props?.children) {
          return getHeadingText(child.props.children);
        }
      }

      return "";
    })
    .join(" ")
    .trim();
};

export function MDXContent({ code, components }: MdxProps) {
  const Component = useMDXComponent(code);
  return (
    <Component
      components={{
        ...components,
        h1: (props: any) => {
          const anchorId =
            typeof props.id === "string" && props.id.length > 0
              ? props.id
              : slugify(getHeadingText(props.children));

          return (
            <h1 {...props}>
              <a
                id={anchorId}
                data-toc-anchor="true"
                className="invisible relative -top-[calc(100vh/3)] block max-h-1 w-32"
              >
                {props.children}
              </a>
              <BackToTopLink>{props.children}</BackToTopLink>
            </h1>
          );
        },
        h2: (props: any) => {
          const anchorId =
            typeof props.id === "string" && props.id.length > 0
              ? props.id
              : slugify(getHeadingText(props.children));

          return (
            <h2 {...props}>
              <a
                id={anchorId}
                data-toc-anchor="true"
                className="invisible relative -top-[calc(100vh/3)] block max-h-1 w-32"
              >
                {props.children}
              </a>
              <BackToTopLink>{props.children}</BackToTopLink>
            </h2>
          );
        },
        h3: (props: any) => {
          const anchorId =
            typeof props.id === "string" && props.id.length > 0
              ? props.id
              : slugify(getHeadingText(props.children));

          return (
            <h3 {...props}>
              <a
                id={anchorId}
                data-toc-anchor="true"
                className="invisible relative -top-[calc(100vh/3)] block max-h-1 w-32"
              >
                {props.children}
              </a>
              {props.children}
            </h3>
          );
        },
        h4: (props: any) => {
          const anchorId =
            typeof props.id === "string" && props.id.length > 0
              ? props.id
              : slugify(getHeadingText(props.children));

          return (
            <h4 {...props}>
              <a
                id={anchorId}
                data-toc-anchor="true"
                className="invisible relative -top-[calc(100vh/3)] block max-h-1 w-32"
              >
                {props.children}
              </a>
              {props.children}
            </h4>
          );
        },
        a: (props: any) => (
          <CustomLink href={props.href} {...props}>
            {props.children}
          </CustomLink>
        ),
        pre: (props: any) => (
          <CopyablePre {...props}>{props.children}</CopyablePre>
        ),
        BadgeGroup,
        PhotoBentoGrid,
        ExternalActionButtonLink,
        LoadMoreLinks,
        CustomLink,
        FilmGrid,
        BookGrid,
        Ratings,
        Link,
        ImagePerspectiveLink,
      }}
    />
  );
}
