# lusail-js

[![npm version](https://badge.fury.io/js/lusail.svg)](https://badge.fury.io/js/lusail) [![CI/CD Workflow](https://github.com/musabhusaini/lusail-js/actions/workflows/main.yaml/badge.svg)](https://github.com/musabhusaini/lusail-js/actions/workflows/main.yaml)

JavaScript implementation of Lusail, a domain-specific language for extracting structured data from
HTML.

<!-- toc -->
- [What is Lusail?](#what-is-lusail)
- [Installation](#installation)
- [Usage](#usage)
- [Supported Transforms](#supported-transforms)
- [Adding Custom Transforms](#adding-custom-transforms)
- [Documentation](#documentation)
- [Development Status](#development-status)
- [Contributing](#contributing)
- [License](#license)

## What is Lusail?

Lusail is an extensible domain-specific language designed to make it easy to express the structure
of the data that needs to be extracted from an HTML document. It relies on a combination of field
definitions and transformation pipelines to dictate data extraction and processing for each field.
The transforms within a pipeline process input data sequentially, with each transform receiving the
output of its predecessor, applying its specific logic, and then passing the result to the
subsequent transform.

A Lusail template can be defined using any object notation. Here's a simple example of a Lusail
template in YAML:

```yaml
# Get the text content of the first element matching the CSS selector "title" and assign it to the
# field "pageTitle".
pageTitle:
  - cssSelector: title
  - get: single
  - get: text
# Get the text content of the first element matching the CSS selector ".description" and assign it
# to the field "pageDescription".
pageDescription:
  - cssSelector: .description
  - get: single
  - get: text
# Get all the href attributes of elements matching the CSS selector "body > a" and assign the
# resulting array to the "links" field.
links:
  - cssSelector: "body > a"
  - attribute: href
# Get all elements matching the CSS selector ".post" and extract certain fields from each.
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

This library is a JavaScript parser for the Lusail language.

## Installation

``` sh
npm install --save lusail
```

## Usage

Create a `Lusail` instance by passing in a template as a JavaScript object:

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

Then parse your HTML as a string:

``` ts
const result = await lusail.parseFromString(html);
```

Or let it fetch the HTML from a URL:

``` ts
const result = await lusail.parseFromUrl(url);
```

## Supported Transforms

### Single

Retrieves a single element from an array by index.

| Property | Description | Required | Default / required value |
| - | - | - | - |
| `getBy` | Explicitly triggers this transform | If `index` is not defined | `single` |
| `index` | The index to pick | If `getBy` is not specified | `0` |

### Range

Retrieves a range of elements by start and end indexes.

| Property | Description | Required | Default / required value |
| - | - | - | - |
| `getBy` | Explicitly triggers this transform | If none of the other properties are provided | `range` |
| `start` | The starting index of the range | If none of the other properties are provided | `0` |
| `end` | The ending index of the range | If none of the other properties are provided | End of the input array |

### CSS Selector

Retrieves elements matching the given selector.

| Property | Description | Required | Default / required value |
| - | - | - | - |
| `getBy` | Explicitly triggers this transform | No | `cssSelector` |
| `cssSelector` | The CSS selector to match elements | Yes | - |

### Element Text

Retrieves the text content of input element(s).

| Property | Description | Required | Default / required value |
| - | - | - | - |
| `getBy` | Triggers this transform | Yes | `text` |

### Attribute

Retrieves the value of the specified attribute of input element(s).

| Property | Description | Required | Default / required value |
| - | - | - | - |
| `getBy` | Explicitly triggers this transform | No | `attribute` |
| `attribute` | The name of the attribute to retrieve | Yes | - |

### Cast

Casts incoming value(s) to a target type.

| Property | Description | Required | Default / required value |
| - | - | - | - |
| `getBy` | Explicitly triggers this transform | No | `cast` |
| `castTo` | The field type to cast the value to | Yes | - |

### Date

Casts incoming value(s) to date(s), using an optional format and locale.

| Property | Description | Required | Default / required value |
| - | - | - | - |
| `getBy` | Explicitly triggers this transform | No | `cast` |
| `castTo` | The field type to cast the value to | Yes | `date` |
| `format` | The [format](https://date-fns.org/v2.29.3/docs/format) of the date string or `'timeAgo'` for relative time | No | [ISO 8601 format](https://date-fns.org/v2.29.3/docs/parseISO) |
| `locale` | The locale to be used when parsing the date | No | - |

### Regex

Applies a regular expression substitution to the input value(s).

| Property | Description | Required | Default / required value |
| - | - | - | - |
| `getBy` | Explicitly triggers this transform | No | `regex` |
| `regex` | The regex pattern to apply | Yes | - |
| `replaceWith` | The string to replace matched patterns with | No | `'$1'` |
| `requireMatch` | Whether to pass the input value if it does not match the pattern | No | `false` |

### Extract Fields

Extracts fields by applying a sub-template to the input.

| Property | Description | Required | Default / required value |
| - | - | - | - |
| `getBy` | Explicitly triggers this transform | No | `fields` |
| `fields` | The LusailTemplate for extracting fields | Yes | - |

### Follow Links

Follows links from input strings and extracts fields given by a sub-template.

| Property | Description | Required | Default / required value |
| - | - | - | - |
| `getBy` | Explicitly triggers this transform | No | `followingLinks`, `followLinks`, or `links` |
| `followLinks` | The LusailTemplate to apply to the linked content | Yes | - |

### Literal

Transforms the input(s) a fixed literal value.

| Property | Description | Required | Default / required value |
| - | - | - | - |
| `getBy` | Explicitly triggers this transform | No | `literal` |
| `literal` | The fixed literal value | Yes | - |

### Hoist

Hoists nested fields to the top level of the result

| Property | Description | Required | Default / required value |
| - | - | - | - |
| `getBy` | Triggers this transform | Yes | `hoist` or `hoisting` |

### Existence

Determines whether the value transformed up to this point exists or not. Existence is determined by
truthiness. If the value is an array, then existence is determined by the existence of a truthy
value in the array.

| Property | Description | Required | Default / required value |
| - | - | - | - |
| `getBy` | Explicitly triggers this transform | No | `existence` or `exists` |
| `exists` | Whether to check for existence (`true`) or absence (`false`) | No | `true` |

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
available in Lusail templates, you need to register it with `Lusail`.

``` ts
import { Lusail } from 'lusail';

function isMyTransform(transform: FieldTransform): transform is MyTransform {
  return transform.getBy === 'mine';
}

Lusail.registerTransform(
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

## Documentation

See [API Documentation](http://musabhusaini.github.io/lusail-js) for more details.

## Development Status

Please note that Lusail is still under development and has not been thoroughly tested. As such, its
use in production environments is not yet recommended. Also note that while we will attempt to
follow semantic versioning for the library, there might be breaking changes between minor versions
from time to time until we reach a stable state. Please report any issues you encounter and/or
[submit a pull request](./CONTRIBUTING.md) so we can make the library better.

## Contributing

This is an evolving project, and contributions are welcome. Please read the
[CONTRIBUTING.md](./CONTRIBUTING.md) file for guidelines on how to contribute.

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.
