import { describe, expect, test } from '@jest/globals';
import { Lusail } from '@lusail/index';
import { parse, subDays, subHours } from 'date-fns';

const subPages: Record<string, string> = {
  'http://link1.com': `
  <html>
    <title>Link 1</title>
  </html>
  `,
  'http://link2.com': `
  <html>
    <title>Link 2</title>
  </html>
  `,
};

const testHtml = `
<html>
  <head>
    <title>Sample page</title>
  </head>
  <body>
    <h1>Welcome to the sample page</h1>
    <a href="https://www.google.com">Google</a>
    <a href="https://www.facebook.com">Facebook</a>
    <div class="post">
      <h2 class="title">Post 1</h2>
      <p class="content">This is the content of post 1.</p>
      <p class="publishedAt">8 hours ago</p>
      <a href="http://link1.com"></a>
      <span class="valid"> Yes </span>
    </div>
    <div class="post">
      <h2 class="title">Post 2</h2>
      <p class="content">This is the content of post 2.</p>
      <p class="publishedAt">2 days ago</p>
      <a href="http://link2.com"></a>
      <span class="valid">No</span>
    </div>
    <div class="special">
      <h2 class="title">Special Post 1</h2>
      <p class="content">This is the content of special post 1.</p>
      <p class="publishedAt">02/03/2021 13:05</p>
    </div>
    <div class="type">Simplified</div>
    <div class="type">Simp</div>
    <div class="generator">New</div>
  </body>
</html>
`;

const template = `
  links:
  - cssSelector: "body > a"
  - getBy: fields
    fields:
      name:
      - getBy: text
      - getBy: single
      url:
      - attribute: href
      - getBy: single
      title:
      - literal: Link to the thing
  pageTitle:
  - cssSelector: title
  - getBy: single
  - getBy: text
  isSpecial:
  - cssSelector: .special
  - index: 0
  - exists: true
  isNotSpecial:
  - cssSelector: .special
  - exists: false
  isOrdinary:
  - cssSelector: .ordinary
  - exists: true
  isNotOrdinary:
  - cssSelector: .ordinary
  - exists: false
  hasPosts:
  - cssSelector: .post
  - exists: true
  special:
  - cssSelector: .special
  - getBy: single
  - fields:
      specialTitle:
      - cssSelector: .title
      - getBy: single
      - getBy: text
      specialContent:
      - cssSelector: .content
      - getBy: single
      - getBy: text
      specialDate:
      - cssSelector: .publishedAt
      - getBy: single
      - getBy: text
      - castTo: date
        format: "MM/dd/yyyy HH:mm"
  - getBy: hoisting
  posts:
  - cssSelector: .post
  - fields:
      title:
      - cssSelector: .title
      - getBy: single
      - getBy: text
      index:
      - cssSelector: .title
      - getBy: single
      - getBy: text
      - regex: "^Post (\\\\d+)$"
        replaceWith: "$1"
      - castTo: number
      content:
      - cssSelector: .content
      - getBy: single
      - getBy: text
      publishedAt:
      - cssSelector: .publishedAt
      - getBy: single
      - getBy: text
      - castTo: date
        format: timeAgo
      valid:
      - cssSelector: .valid
      - index: 0
      - getBy: text
      - castTo: boolean
      links:
      - cssSelector: a
      - getBy: single
      - attribute: href
      - followLinks:
          subTitle:
          - cssSelector: title
          - getBy: single
          - getBy: text
      - getBy: hoisting
  type:
  - cssSelector: '.type'
  - getBy: text
  - map:
      Simple: simple
      simplified: simple
      Simplified: simple
  generator:
  - cssSelector: '.generator'
  - index: 0
  - getBy: text
  - map:
      Syn: synthetic
    strict: true
`;

describe('Lusail', () => {
  test('parses example HTML and Lusail definition correctly', async () => {
    const referenceDate = parse(
      '2023/01/28 12:00 PM',
      'yyyy/MM/dd hh:mm a',
      new Date(),
    );
    const lusail = Lusail.fromYaml(template, {
      referenceDate: referenceDate,
      fetchFunction: (url) => Promise.resolve(subPages[url]),
    });
    const result = await lusail.parseFromString(testHtml);

    const expectedResult = {
      pageTitle: 'Sample page',
      links: [
        {
          name: 'Google',
          url: 'https://www.google.com',
          title: 'Link to the thing',
        },
        {
          name: 'Facebook',
          url: 'https://www.facebook.com',
          title: 'Link to the thing',
        },
      ],
      isSpecial: true,
      isNotSpecial: false,
      isOrdinary: false,
      isNotOrdinary: true,
      hasPosts: true,
      specialTitle: 'Special Post 1',
      specialContent: 'This is the content of special post 1.',
      specialDate: parse('02/03/2021 13:05', 'MM/dd/yyyy HH:mm', new Date()),
      posts: [
        {
          title: 'Post 1',
          index: 1,
          content: 'This is the content of post 1.',
          publishedAt: subHours(referenceDate, 8),
          subTitle: 'Link 1',
          valid: true,
        },
        {
          title: 'Post 2',
          index: 2,
          content: 'This is the content of post 2.',
          publishedAt: subDays(referenceDate, 2),
          subTitle: 'Link 2',
          valid: false,
        },
      ],
      type: ['simple', 'Simp'],
      generator: null,
    };

    console.log(result);

    expect(result).toEqual(expectedResult);
  });
});
