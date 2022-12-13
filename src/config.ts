import type { SocialObjects } from "./types";

export const SITE = {
  website: "https://felixwie.com/",
  author: "Felix Wieland",
  desc: "A tech blog",
  title: "felixwie",
  ogImage: "astropaper-og.jpg",
  lightAndDarkMode: false,
  postPerPage: 5,
};

export const LOGO_IMAGE = {
  enable: false,
  svg: true,
  width: 216,
  height: 46,
};

export const SOCIALS: SocialObjects = [
  {
    name: "Github",
    href: "https://github.com/flexwie",
    linkTitle: ` ${SITE.title} on Github`,
    active: true,
  },
  {
    name: "LinkedIn",
    href: "https://linkedin.com/in/flexwie",
    linkTitle: `${SITE.title} on LinkedIn`,
    active: true,
  },
];
