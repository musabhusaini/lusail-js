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
    </div>
    <div class="post">
      <h2 class="title">Post 2</h2>
      <p class="content">This is the content of post 2.</p>
      <p class="publishedAt">2 days ago</p>
      <a href="http://link2.com"></a>
    </div>
    <div class="special">
      <h2 class="title">Special Post 1</h2>
      <p class="content">This is the content of special post 1.</p>
      <p class="publishedAt">02/03/2021 13:05</p>
    </div>
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
  pageTitle:
  - cssSelector: title
  - getBy: single
  - getBy: text
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
        { name: 'Google', url: 'https://www.google.com' },
        { name: 'Facebook', url: 'https://www.facebook.com' },
      ],
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
        },
        {
          title: 'Post 2',
          index: 2,
          content: 'This is the content of post 2.',
          publishedAt: subDays(referenceDate, 2),
          subTitle: 'Link 2',
        },
      ],
    };

    console.log(result);

    expect(result).toEqual(expectedResult);
  });
});
