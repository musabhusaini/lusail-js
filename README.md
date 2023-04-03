# lusail-js

JavaScript implementation of Lusail, a domain-specific language for extracting structured data from
HTML.

## What is Lusail?

Lusail is an extensible domain-specific language designed to make it easy to express the structure
of the data that needs to be extracted from an HTML document.

A Lusail template can be defined in any format that can be converted to a JavaScript object, and
consists of a series of field definitions and transformation pipelines that guide the extraction
process.

Here's a simple example of a Lusail template in YAML notation:

```yaml
pageTitle:
  - cssSelector: title
  - get: single
  - get: text
pageDescription:
  - cssSelector: .description
  - get: single
  - get: text
links:
  - cssSelector: "body > a"
  - attribute: href
posts:
  - cssSelector: .post
  - fields:
      title:
        - cssSelector: .title
        - get: single
        - get: text
      content:
        - cssSelector: .content
        - get: single
        - get: text
```

The above example instructs the parser to find HTML elements matching the css selector `.title`,
extract the first of such elements, and get its text content, and assign it to the property
`pageTitle` of the output.

Now consider this HTML document:

``` html
<html>
  <head>
    <title>Lusail</title>
  </head>
  <body>
    <h1 class="description">JavaScript implementation of Lusail</h1>
    <a href="https://www.example.com">Example</a>
    <a href="https://www.github.com">Example 2</a>
    <div class="post">
      <h2 class="title">Post 1</h2>
      <p class="content">Content 1.</p>
    </div>
    <div class="post">
      <h2 class="title">Post 2</h2>
      <p class="content">Content 2.</p>
    </div>
  </body>
</html>
```

Applying the above template to the given HTML document will produce:

``` json
{
  "pageTitle": "Lusail",
  "pageDescription": "JavaScript implementation of Lusail",
  "links": [ "https://www.example.com", "https://www.github.com" ],
  "posts": [
    { "title": "Post 1", "content": "Content 1." },
    { "title": "Post 2", "content": "Content 2." }
  ]
}
```

This library is a TypeScript/JavaScript parser for the Lusail language.

### Installation

``` sh
npm install --save lusail
```

### Usage

#### 1. Create Lusail instance

You can pass in the template as a JavaScript or TypeScript object:

```ts
import { Lusail, LusailTemplate } from 'lusail';

// Define your Lusail template.
const template: LusailTemplate = {
  pageTitle: [
    { cssSelector: '.title' },
    { get: 'single', index: 0 },
    { get: 'text' },
  ],
};

// Create a Lusail instance.
const lusail = new Lusail(template);
```

Or define it as a YAML template for a more concise structure:

``` ts
import { Lusail } from 'lusail';

const yamlTemplate = `
pageTitle:
  - cssSelector: .title
  - get: single
    index: 0
  - get: text
`;

const lusail = Lusail.fromYaml(yamlTemplate);
```

#### 2. Parse

``` ts
const result = await lusail.parseFromString(html);
```

## Adding Custom Transforms

Lusail-js allows you to extend its functionality by registering custom transformations. These
additional transformations can then be used in your Lusail templates.

Here's how to create and register a custom plugin:

### 1. Create a custom transformer

Implement a custom transformer that extends the [`Transformer`](./src/transformer.ts) abstract
class.

``` ts
import { FieldTransform, Transformer, TransformerFactories } from 'lusail';

export interface MyTransform extends FieldTransform<'mine'> {
  myOption: any;
}

export default class MyTransformer extends Transformer<MyTransform> {
  async execute(input: Element | Element[]): Promise<string | string[]> {
    // Your transformation logic goes here...
  }
}
```

### 2. Register a custom transformer factory

A custom transformer factory is a function that returns a `Transformer` instance if the given
`FieldTransform` matches the custom transformation type. To make your custom transformation
available in Lusail templates, you need to register it using the `TransformerFactories` singleton.

``` ts
import { TransformerFactories } from 'lusail';

function isMyTransform(transform: FieldTransform): transform is MyTransform {
  return transform.getBy === 'mine';
}

TransformerFactories.instance.registerTransform(
  (transform, options) => {
    return MyTransformer.isMyTransform(transform)
      ? new MyTransformer(transform, options)
      : undefined;
  },
  // Optional precedence argument. Factories that claim higher precedence will be chosen over those
  // with lower precedence in case of conflict.
  2
);
```

### 3. Use the custom transformer in your templates

Now, your custom transformation type can be used in Lusail templates:

``` yaml
customField:
  - getBy: mine
    myOption: <value>
```

## Contributing

This is an evolving project, and contributions are welcome. Please read the
[CONTRIBUTING.md](./CONTRIBUTING.md) file for guidelines on how to contribute.

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.
