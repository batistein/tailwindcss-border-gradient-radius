const plugin = require('tailwindcss/plugin');
const _ = require('lodash');
const Color = require('color');


const flattenColorPalette = function(colors) {
    return _(colors)
      .flatMap((color, name) => {
        if (!_.isPlainObject(color)) {
          return [[name, color]];
        }
        return _.map(color, (value, key) => {
          const suffix = key === 'default' ? '' : `-${key}`;
          return [`${name}${suffix}`, value];
        });
      })
      .fromPairs()
      .value();
  };
  
  const normalizeColors = function(colors, transparentFirst = true) {
    colors = _.castArray(colors);
    const unsupportedColorKeywords = ['inherit', 'initial', 'unset', 'revert'];
    if (_.intersection(unsupportedColorKeywords, colors).length > 0) {
      return null;
    }
    if (colors.length === 1) {
      const color = colors[0];
      let transparentColor = 'transparent';
      try {
        const parsedColor = Color(color);
        transparentColor = parsedColor.alpha(0).rgb().string();
      }
      catch (e) {
      }
      colors = transparentFirst ? [transparentColor, color] : [color, transparentColor];
    }
    return colors;
  };
  
  module.exports = plugin(function({ theme, variants, e, addUtilities }) {

    const defaultLinearBorderGradientDirections = {
      't': 'to top',
      'tr': 'to top right',
      'r': 'to right',
      'br': 'to bottom right',
      'b': 'to bottom',
      'bl': 'to bottom left',
      'l': 'to left',
      'tl': 'to top left',
    };
    const defaultLinearBorderGradientColors = {};
    const defaultLinearBorderGradientBackgroundColors = {};
    const defaultLinearBorderGradientBorderWidth = {
      '1': '1px',
      '2': '2px',
      '4': '4px',
    };
    const defaultLinearBorderGradientVariants = ['responsive'];

    const linearBorderGradientDirections = theme('linearBorderGradients.directions', defaultLinearBorderGradientDirections);
    const linearBorderGradientColors = theme('linearBorderGradients.colors', defaultLinearBorderGradientColors);
    const linearBorderGradientBackgroundColor = theme('linearBorderGradients.background', defaultLinearBorderGradientBackgroundColors);
    const linearBorderGradientBorderWidth = theme('linearBorderGradients.border', defaultLinearBorderGradientBorderWidth);
    const linearBorderGradientVariants = variants('linearBorderGradients', defaultLinearBorderGradientVariants);
    

    const linearBorderGradientSelector = function(directionKey, colorKey, backgroundKey, borderKey) {
      return `.${e(`border-gradient-${directionKey}-${colorKey}-${backgroundKey}-${borderKey}`)}`;
    };

    const linearBorderGradientValue = function(direction, colors) {
      const cssDefaultLinearBorderGradientDirections = ['to bottom', '180deg', '0.5turn', '200grad', '3.1416rad'];
      return `linear-gradient(${_.includes(cssDefaultLinearBorderGradientDirections, direction) ? '' : `${direction}, `}${colors.join(', ')})`;
    };

    const linearBorderGradientBackgroundColorValue = function(gradientBackgroundColor) {
      return `linear-gradient( to right, ${gradientBackgroundColor}, ${gradientBackgroundColor} )`;
    };

    const linearBorderGradientBorderValue = function(border) {
      return `${border} solid transparent`;
    }

    const linearBorderGradientUtilities = (function() {
      let utilities = {};
      _.forEach(flattenColorPalette(linearBorderGradientColors), (colors, colorKey) => {
        colors = normalizeColors(colors, true);
        if (!colors) {
          return; // continue
        }
        _.forEach(flattenColorPalette(linearBorderGradientBackgroundColor), (gradientBackgroundColor, backgroundKey) => {
          gradientBackgroundColor = _.tail(normalizeColors(gradientBackgroundColor, true));
          if (!gradientBackgroundColor) {
            return; // continue
          }
          _.forEach(linearBorderGradientBorderWidth, (border, borderKey) => { 
            _.forEach(linearBorderGradientDirections, (direction, directionKey) => {
              utilities[linearBorderGradientSelector(directionKey, colorKey, backgroundKey, borderKey)] = {
                border: linearBorderGradientBorderValue(border),
                background: 
                    `${linearBorderGradientBackgroundColorValue(gradientBackgroundColor)}, ${linearBorderGradientValue(direction, colors)}`,
                backgroundClip: 'padding-box, border-box',
                backgroundOrigin: 'padding-box, border-box',
              };
            });
          });
        });
      });
      return utilities;
    })();
  
      addUtilities(linearBorderGradientUtilities, linearBorderGradientVariants);
      
  });