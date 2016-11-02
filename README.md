# postcss-text-remove-gap

[PostCSS] plugin to remove space before and after text strings, added by 
line-height and extra space in glyph itself.

[PostCSS]: https://github.com/postcss/postcss

New CSS property:

```
text-remove-gap: outside? <type> <line-height>? <font-family>?;
```

* `outside` – if specified, remove gaps outside the block (using margins on
  block itself instead of margins of internal pseudo-elements).
* `type` – is only required value, can be:
  - `before` – remove gap before (above) block,
  - `after` – remove gap after (below) block,
  - `both` – remove gaps before and after block.
* `line-height` – overwrite line-height value.
* `font-family` – overwrite font-family value.

## Example

Illustration:

*Before:*  
![Block with red border and two paragraphs inside. There is some space before 
and after paragraph of text.](example-before.png)

*After:*  
![Block with red border and two paragraphs inside. There is no space before 
and after paragraph of text.](example-after.png)

Input:

```css
p
{
	font: 16px/1.5 "Arial", sans-serif;
	text-remove-gap: both;
}
```

Output:

```css
p
{
	font: 16px/1.5 "Arial", sans-serif;
}
p::before
{
	display: block;
	content: "";
	margin-bottom: -0.63em;
}
p::after
{
	display: block;
	content: "";
	margin-top: -0.67em;
}
```

Input:

```css
p
{
	font-family: "Arial", sans-serif;
	line-height: 1.5;
	text-remove-gap: outside both;
}
```

Output:

```css
p
{
	font-family: "Arial", sans-serif;
	line-height: 1.5;
	margin-top: -0.63em;
	margin-bottom: -0.67em;
}
```

You can find more examples in [test.js](test.js).

## Install

```
npm install --save-dev postcss-text-remove-gap
```

## Usage

With Gulp:

```js
var gulp = require( 'gulp' );
var postcss = require( 'gulp-postcss' );
var textRemoveGap = require( 'postcss-text-remove-gap' );

gulp.task(
	'styles',
	function ()
	{
		var textRemoveGapOptions = {
			prefix: 'm18',
			fonts: {
				'My Font': [0.1, 0.2],
				'My Other Font': [0.12, 0.14]
			},
			defaultFontFamily: 'My Font'
		};
		
		gulp.src( './styles/src/**/*.css' )
			.pipe( postcss( [textRemoveGap( textRemoveGapOptions )] ) )
			.pipe( gulp.dest( './styles/' ) );
	}
);
```

Input (file `styles/src/test.css`):

```css
p
{
	font: 16px/1.5 "Arial", sans-serif;
	-m18-text-remove-gap: both;
}

div.other p
{
	font-family: "Arial", sans-serif;
	line-height: 1.5;
	-m18-text-remove-gap: outside both;
}

li
{
	line-height: 2;
	-m18-text-remove-gap: both;
}

blockquote
{
	font-family: "My Other Font", sans-serif;
	line-height: 2;
	-m18-text-remove-gap: both;
}
```

Output (file `styles/test.css`):

```css
p
{
	font: 16px/1.5 "Arial", sans-serif;
}

p::before
{
	display: block;
	content: "";
	margin-bottom: -0.38em;
}

p::after
{
	display: block;
	content: "";
	margin-top: -0.42em;
}

div.other p
{
	font-family: "Arial", sans-serif;
	line-height: 1.5;
	margin-top: -0.38em;
	margin-bottom: -0.42em;
}

li
{
	line-height: 2;
}

li::before
{
	display: block;
	content: "";
	margin-bottom: -0.6em;
}

li::after
{
	display: block;
	content: "";
	margin-top: -0.7em;
}

blockquote
{
	font-family: "My Other Font", sans-serif;
	line-height: 2;
}

blockquote::before
{
	display: block;
	content: "";
	margin-bottom: -0.62em;
}

blockquote::after
{
	display: block;
	content: "";
	margin-top: -0.64em;
}
```

## Options

### `prefix`

Type: `string`  
Default: `''` *(empty, no prefix)*

Adds the prefix surrounded by dashes before the property name.

### `fonts`

Type: `object`  
Default: `{}`

Object with spaces for custom fonts.

```js
{
	"Font Name": [spaceBefore, spaceAfter]
}
```

Values `spaceBefore` and `spaceAfter` are numbers 0..1 representing the ratio 
of the space before and after text to the font size (percentages/100%).

The best way to calculate this values is to create block with background color 
and required font. Set `line-height` to `1` and `font-size` to `100px`. Write 
“E” character or other simular to easily find top and bottom boundary of it. 
Measure the distance from the block boundary to the character.

For example:

```css
div
{
	font: 100px/1 "Open Sans", sans-serif;
	background: gray;
}
```

```html
<div>E<div>
```

![Space above “E” is 17px → spaceBefore = 0.17, space below “E” is 11px → 
spaceAfter = 0.11](example-measure.png)

Plugin has build-in database with fonts metrics in file 
[fonts.json](fonts.json).  
You can contribute new common fonts with pull request, or just use your own
collection with this option.

### `defaultFontFamily`

Type: `string` | `string[]`  
Default: `'serif'`

Font to use when no other font specified. Used when CSS block has no 
`font-family`, `font`, or `font-family` value of plugin property specified.

### `defaultLineHeight`

Type: `number`  
Default: `1`

Line-height to use when no other line-height specified. Used when CSS block 
has no `line-height`, `font` with line-height, or `line-height` value of 
plugin property specified.
