var postcss = require( 'postcss' );
var fontHelpers = require( 'postcss-font-helpers' );
var selectorParser = require( 'postcss-selector-parser' );

/**
 * Internal fonts database
 */
var defaultFonts = require( './fonts.json' );

/**
 * Selector property name
 */
var PROPERTY_NAME = 'text-remove-gap';
/**
 * RegExp pattern for value of the property
 */
var VALUE_PATTERN = /^\s*(outside\b)?\s*((?:before|after|both)\b)\s*(?:(\d*\.\d+|\d+)(%|[a-zA-Z]+)?)?(\s.+)?$/;

/**
 * Remove space before and after text strings, added by line-height and extra space in glyph itself
 * 
 * Availible options:
 * - `prefix` — Adds the prefix surrounded by dashes before the property name (default none).
 * - `fonts` — Object with information for additional fonts.
 * - `defaultFontFamily` — Font to use when no other font specified.
 * - `defaultLineHeight` — Line-height to use when no other line-height specified.
 * 
 * @param options Options
 */
function main( options )
{
	options = options || {};
	
	var property = ( options.prefix ? '-' + options.prefix + '-' : '' ) + PROPERTY_NAME;
	options.defaultLineHeight = Number( options.defaultLineHeight ) || 1;
	options.defaultFontFamily = options.defaultFontFamily || 'serif';
	options.fonts = options.fonts || {};
	
	var fonts = objectAssign( {}, defaultFonts, options.fonts );
	
	return function ( root, result )
	{
		root.walkRules( processRules );
	};
	
	/**
	 * Process CSS rule
	 * 
	 * @param rule PostCSS node of CSS rule
	 */
	function processRules( rule )
	{
		rule.walkDecls(
			property,
			function ( declaration )
			{
				processProperty( declaration, fontHelpers( rule ) );
			}
		);
	}
	
	/**
	 * Process property in CSS
	 * 
	 * @param declaration Property declaration
	 * @param fontInfo All font values in rule
	 */
	function processProperty( declaration, fontInfo )
	{
		var matches = VALUE_PATTERN.exec( declaration.value );
		
		if ( !matches )
		{
			throw declaration.error( 'Incorrect property value.' );
		}
		
		var mode = matches[1] || 'inside';
		var type = matches[2];
		var lineHeight = Number( matches[3] );
		var lineHeightUnits = matches[4] || '';
		var fontFamilyString = ( matches[5] || '' ).trim();
		var fontFamily = (
			fontFamilyString
			? fontFamilyString.split( /\s*,\s*/ ).map( unquote )
			: ( fontInfo.family ? [].concat( fontInfo.family ) : [] )
		);
		fontFamily = fontFamily.concat( options.defaultFontFamily );
		
		if ( !lineHeight )
		{
			matches = /^(\d*\.\d+|\d+)(%|[a-zA-Z]+)?$/.exec( fontInfo.lineHeight );
			
			if ( matches )
			{
				lineHeight = Number( matches[1] );
				lineHeightUnits = matches[2] || '';
			}
			else
			{
				lineHeight = options.defaultLineHeight;
			}
		}
		
		switch ( lineHeightUnits )
		{
			case 'em':
				lineHeightUnits = '';
				break;
			
			case '%':
				lineHeight = Number( (lineHeight / 100).toFixed( 2 ) );
				lineHeightUnits = '';
				break;
		}
		
		var offsetValues = toOffsetValues(
			findFontSpaceValues( fontFamily, fonts ),
			lineHeight,
			lineHeightUnits
		);
		
		if ( !offsetValues[0] && !offsetValues[1] )
		{
			declaration.remove();
			return;
		}
		
		switch ( mode )
		{
			case 'outside':
				modeOutside( type, offsetValues, declaration );
				break;
			
			case 'inside':
				modeInside( type, offsetValues, declaration );
				break;
			
			default:
				throw declaration.error( 'Unknown mode: ' + mode );
		}
	}
}

/**
 * Output code for outside mode
 * 
 * @param type Where to remove space - before, after or both
 * @param offsetValues CSS offset values
 * @param declaration Property declaration
 */
function modeOutside( type, offsetValues, declaration )
{
	if (
		( type === 'before' )
		|| ( type === 'both' )
	)
	{
		declaration.prop = 'margin-top';
		declaration.value = offsetValues[0];
		
		if ( type === 'before' )
		{
			return;
		}
		
		declaration.cloneAfter(
			{
				prop: 'margin-bottom',
				value: offsetValues[1]
			}
		);
	}
	else if ( type === 'after' )
	{
		declaration.prop = 'margin-bottom';
		declaration.value = offsetValues[1];
	}
}

/**
 * Output code for inside mode
 * 
 * @param type Where to remove space - before, after or both
 * @param offsetValues CSS offset values
 * @param declaration Property declaration
 */
function modeInside( type, offsetValues, declaration )
{
	var rule = declaration.parent;
	
	var createPseudo = function ( after )
	{
		var pseudo = rule.cloneAfter(
			{
				selector: appendToSelector( rule.selector, '::' + ( after ? 'after' : 'before' ) )
			}
		);
		
		pseudo.removeAll();
		pseudo.source = declaration.source;
		pseudo.append( {prop: 'display', value: 'table', source: declaration.source} );
		pseudo.append( {prop: 'content', value: '""', source: declaration.source} );
		
		return pseudo;
	};
	
	if ( ( type === 'before' ) || ( type === 'both' ) )
	{
		var pseudoBefore = createPseudo( false );
		
		if ( type === 'both' )
		{
			var pseudoAfter = pseudoBefore.cloneAfter(
				{
					selector: appendToSelector( rule.selector, '::after' )
				}
			);
			pseudoAfter.append( {prop: 'margin-top', value: offsetValues[1], source: declaration.source} );
		}
		
		pseudoBefore.append( {prop: 'margin-bottom', value: offsetValues[0], source: declaration.source} );
	}
	else if ( type === 'after' )
	{
		var pseudoAfter = createPseudo( true );
		
		pseudoAfter.append( {prop: 'margin-top', value: offsetValues[1], source: declaration.source} );
	}
	
	declaration.remove();
}

/**
 * Append pseudo-element to the selector
 * 
 * @param selector Selector
 * @param pseudo Pseudo-element
 * @returns Selector
 */
function appendToSelector( selector, pseudo )
{
	var transform = function ( selectors )
	{
		var selectorIndex = -1;
		var selector;
		
		while ( selector = selectors.nodes[++selectorIndex] )
		{
			selector.append(
				selectorParser.pseudo( {value: pseudo} )
			);
		}
	};
	
	return selectorParser( transform ).process( selector ).result;
}

/**
 * Returns space values for the font
 * 
 * @param fontFamily Array of font-family string
 * @param fonts Fonts database
 * @returns Array [space before, space after]
 */
function findFontSpaceValues( fontFamily, fonts )
{
	for ( var i = 0, n = fontFamily.length; i < n; i++ )
	{
		var font = fontFamily[i];
		
		if ( fonts[font] )
		{
			return fonts[font];
		}
	}
	
	return [0, 0];
}

/**
 * Convert space values to offset values for CSS
 * 
 * @param spaceValues Space values
 * @param lineHeight Line height value
 * @param lineHeightUnits Line height units
 * @returns
 */
function toOffsetValues( spaceValues, lineHeight, lineHeightUnits )
{
	if (
		( spaceValues[0] === 0 )
		&& ( spaceValues[1] === 0 )
		&& ( lineHeight === 1 )
	)
	{
		return ['', ''];
	}
	
	if ( !lineHeightUnits )
	{
		var heightCorrection = (lineHeight - 1) / 2;
		
		return [
			Number( (-spaceValues[0] - heightCorrection).toFixed( 2 ) ) + 'em',
			Number( (-spaceValues[1] - heightCorrection).toFixed( 2 ) ) + 'em'
		];
	}
	
	return [
		'calc(' + (-spaceValues[0]) + 'em - (' + lineHeight + lineHeightUnits + ' - 1em) / 2)',
		'calc(' + (-spaceValues[1]) + 'em - (' + lineHeight + lineHeightUnits + ' - 1em) / 2)',
	];
}

/**
 * Remove wrapping quotes from a string
 * 
 * @param value Original string
 * @returns Unquoted string
 */
function unquote( value )
{
	return (
		value
		? value.replace( /^(['"])(.*)\1$/, '$2' )
		: ''
	);
}

/**
 * Simple object assign implementation
 * 
 * @param target Target object
 * @param ...rest Other objects
 * @returns Target object
 */
function objectAssign( target )
{
	var result = ( target ? Object( target ) : {} );
	
	for ( var i = 1, n = arguments.length; i < n; i++ )
	{
		if ( !arguments[i] )
		{
			continue;
		}
		
		var object = Object( arguments[i] );
		var keys = Object.keys( object );
		
		for ( var j = 0, m = keys.length; j < m; j++ )
		{
			var key = keys[j];
			
			result[key] = object[key];
		}
	}
	
	return result;
}

/**
 * Plugin module
 */
module.exports = postcss.plugin(
	'postcss-closest',
	main
);
