document.addEventListener("mouseup", () => {
  console.log("Mouseup event triggered");
  const selection = window.getSelection();
  const text = selection.toString().trim();

  if (text.length > 0) {
      console.log("Selected text:", text);
      const converted = convertImperialToMetric(text);
      console.log("Converted text:", converted);
      if (converted !== text && selection.rangeCount > 0) {
          console.log("Showing tooltip");
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          showTooltipBelow(rect, converted);
      } else {
          console.log("No conversion or no range, scheduling hide");
          scheduleHideTooltip();
      }
  } else {
      console.log("No text selected, scheduling hide");
      scheduleHideTooltip();
  }
});

function convertImperialToMetric(text) {
  console.log("Converting text:", text);

  const troyConversions = [
      {
          regex: /(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\b)?\s*\b(troy ounces|troy ounce|ozt|oz t)\b/gi,
          convert: value => {
              const numericValue = value ? value.replace(/,/g, '') : '1';
              const inNumber = parseFloat(numericValue);
              if (isNaN(inNumber)) return value;
              const grams = inNumber * 31.1035;
              if (grams >= 1000) {
                  return `${(grams / 1000).toFixed(2)} kg`;
              }
              return `${grams.toFixed(2)} g`;
          }
      },
      {
          regex: /(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\b)?\s*\b(troy pounds|troy pound|lb t|lb troy)\b/gi,
          convert: value => {
              const numericValue = value ? value.replace(/,/g, '') : '1';
              const inNumber = parseFloat(numericValue);
              if (isNaN(inNumber)) return value;
              const grams = inNumber * 373.2417;
              if (grams >= 1000) {
                  return `${(grams / 1000).toFixed(2)} kg`;
              }
              return `${grams.toFixed(2)} g`;
          }
      }
  ];

  const pressureConversions = [
      {
          regex: /(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\b)?\s*\b(inches of mercury|inch of mercury|inHg|in Hg)\b/gi,
          convert: value => {
              const numericValue = value ? value.replace(/,/g, '') : '1';
              const inHgValue = parseFloat(numericValue);
              if (isNaN(inHgValue)) return value;
              const mmHg = (inHgValue * 25.4).toFixed(2);
              const pascal = (inHgValue * 3386.39).toFixed(1);
              return `${mmHg} mmHg (${pascal} Pa)`;
          }
      }
  ];

  const compoundConversions = [
      {
          regex: /(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\b)?\s*\b(square foot|square feet|sq ft|ft²)\b/gi,
          convert: value => {
              const numericValue = value ? value.replace(/,/g, '') : '1';
              const number = parseFloat(numericValue);
              if (isNaN(number)) return value;
              const metricValue = number * 0.092903;
              console.log(`Converting ${value} square foot to ${metricValue.toFixed(2)} m²`);
              return `${metricValue.toFixed(2)} m²`;
          }
      },
      {
          regex: /(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\b)?\s*\b(acre-foot|acre feet|acre-ft)\b/gi,
          convert: value => {
              const numericValue = value ? value.replace(/,/g, '') : '1';
              const number = parseFloat(numericValue);
              if (isNaN(number)) return value;
              const metricValue = number * 1233.48184;
              console.log(`Converting ${value} acre-foot to ${metricValue.toFixed(2)} m³`);
              return `${metricValue.toFixed(2)} m³`;
          }
      },
      {
          regex: /(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\b)?\s*\b(board foot|board feet|fbm|bd ft)\b/gi,
          convert: value => {
              const numericValue = value ? value.replace(/,/g, '') : '1';
              const number = parseFloat(numericValue);
              if (isNaN(number)) return value;
              const metricValue = number * 0.00235974;
              console.log(`Converting ${value} board foot to ${metricValue.toFixed(2)} m³`);
              return `${metricValue.toFixed(2)} m³`;
          }
      },
      {
          regex: /(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\b)?\s*\b(cord|cords)\b/gi,
          convert: value => {
              const numericValue = value ? value.replace(/,/g, '') : '1';
              const number = parseFloat(numericValue);
              if (isNaN(number)) return value;
              const metricValue = number * 3.62456;
              console.log(`Converting ${value} cord to ${metricValue.toFixed(2)} m³`);
              return `${metricValue.toFixed(2)} m³`;
          }
      },
      {
          regex: /(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\b)?\s*\b(square mile|square miles|mi²|sq mi)\b/gi,
          convert: value => {
              const numericValue = value ? value.replace(/,/g, '') : '1';
              const number = parseFloat(numericValue);
              if (isNaN(number)) return value;
              const metricValue = number * 2.58999;
              console.log(`Converting ${value} square mile to ${metricValue.toFixed(2)} km²`);
              return `${metricValue.toFixed(2)} km²`;
          }
      },
      {
          regex: /(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\b)?\s*\b(square rod|square rods|square pole|square poles|square perch|square perches)\b/gi,
          convert: value => {
              const numericValue = value ? value.replace(/,/g, '') : '1';
              const number = parseFloat(numericValue);
              if (isNaN(number)) return value;
              const metricValue = number * 25.2929;
              console.log(`Converting ${value} square rod to ${metricValue.toFixed(2)} m²`);
              return `${metricValue.toFixed(2)} m²`;
          }
      }
  ];

  let converted = text;

  // Обработка высоты
  converted = converted.replace(/(\d{1,2})\s*[′']\s*(\d{1,2})?\s*(?:["″])?/g, (match, feetStr, inchStr) => {
      const feet = parseInt(feetStr, 10);
      const inches = inchStr ? parseInt(inchStr, 10) : 0;
      if (isNaN(feet)) return match;
      const totalInches = feet * 12 + inches;
      const cm = (totalInches * 2.54).toFixed(2);
      console.log(`Converting ${match} to ${cm} cm`);
      return `${cm} cm`;
  });

  // Обработка температуры
  const tempRegex = /(-?\d+(?:\.\d+)?)\s*(°F|Fahrenheit|° Fahrenheit|°Fahrenheit)\b/gi;
  converted = converted.replace(tempRegex, (_, value) => {
      const f = parseFloat(value);
      if (isNaN(f)) return value;
      const c = ((f - 32) * 5 / 9).toFixed(2);
      console.log(`Converting ${value}°F to ${c}°C`);
      return `${c}°C`;
  });

  for (const { regex, convert } of compoundConversions) {
      converted = converted.replace(regex, (_, value) => convert(value));
  }

  for (const { regex, convert } of pressureConversions) {
      converted = converted.replace(regex, (_, value) => convert(value));
  }

  for (const { regex, convert } of troyConversions) {
      converted = converted.replace(regex, (_, value) => convert(value));
  }

  function formatWithAdaptivePrecision(value, unit = 'mm') {
    if (unit === 'mm') {
        if (value >= 0.01) {

          return `${value.toFixed(2)} ${unit}`;
        } else if (value >= 0.001) {

            return `${value.toFixed(4)} ${unit}`;
        } else {

            return `${value.toFixed(6)} ${unit}`;
        }
    }
    return `${value.toFixed(2)} ${unit}`;
}

  const conversions = [
    // Специфичные единицы
    { regex: /(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\b)?\s*\b(fluid drachm|fluidram|fluid dram|drams fluid)\b/gi, factor: 3.6967, unit: 'ml' },
    { regex: /(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\b)?\s*\b(fluid ounces|fluid ounce|fl oz)\b/gi, factor: 28.4131, unit: 'ml' },
    { regex: /(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\b)?\s*\b(nautical mile|nautical miles|nmi)\b/gi, factor: 1852, unit: 'm' },
    { regex: /(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\b)?\s*\b(fluid scruple|scruples fluid)\b/gi, factor: 1.233, unit: 'ml' },
    { regex: /(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\b)?\s*\b(cubic inch(?:es)?|cu in|in³)\b/gi, factor: 16.387064, unit: 'cm³' },
    { regex: /(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\b)?\s*\b(cubic foot|cubic feet|cu ft|ft³)\b/gi, factor: 0.0283168, unit: 'm³' },
    // Длина
    { regex: /(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\b)?\s*\b(inch(?:es)?|in)\b/gi, factor: 2.54, unit: 'cm' },
    { regex: /(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\b)?\s*\b(foot|feet|ft)\b/gi, factor: 0.3048, unit: 'm' },
    { regex: /(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\b)?\s*\b(yard|yards|yd)\b/gi, factor: 0.9144, unit: 'm' },
    { regex: /(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\b)?\s*\b(mile|miles|mi)\b/gi, factor: 1.60934, unit: 'km' },
    { regex: /(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\b)?\s*\b(fathom|fathoms|ftm)\b/gi, factor: 1.8288, unit: 'm' },
    { regex: /(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\b)?\s*\b(chain|chains|ch)\b/gi, factor: 20.1168, unit: 'm' },
    { regex: /(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\b)?\s*\b(rod|rods|pole|poles|perch|perches)\b/gi, factor: 5.0292, unit: 'm' },
    { regex: /(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\b)?\s*\b(furlong|furlongs)\b/gi, factor: 201.168, unit: 'm' },
    { regex: /(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\b)?\s*\b(league|leagues)\b/gi, factor: 4828.03, unit: 'm' },
    // Масса
    { regex: /(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\b)?\s*\b(pound|pounds|lb|lbs)\b/gi, factor: 0.453592, unit: 'kg' },
    { regex: /(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\b)?\s*\b(ounce|ounces|oz)\b/gi, factor: 28.3495, unit: 'g' },
    { regex: /(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\b)?\s*\b(stone|st)\b/gi, factor: 6.35029, unit: 'kg' },
    { regex: /(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\b)?\s*\b(hundredweight|cwt)\b/gi, factor: 50.8023, unit: 'kg' },
    { regex: /(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\b)?\s*\b(ton|tons|long ton)\b/gi, factor: 1016.05, unit: 'kg' },
    { regex: /(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\b)?\s*\b(short ton|US ton)\b/gi, factor: 907.1847, unit: 'kg' },
    { regex: /(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\b)?\s*\b(grain|grains)\b/gi, factor: 0.0647989, unit: 'g' },
    { regex: /(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\b)?\s*\b(drachm|drams|dram)\b/gi, factor: 1.77185, unit: 'g' },
    { regex: /(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\b)?\s*\b(quarter|quarters)\b/gi, factor: 12.7006, unit: 'kg' },
    // Объём
    { regex: /(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\b)?\s*\b(pints|pint|pt)\b/gi, factor: 0.568261, unit: 'l' },
    { regex: /(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\b)?\s*\b(quarts|quart|qt)\b/gi, factor: 1.13652, unit: 'l' },
    { regex: /(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\b)?\s*\b(gallons|gallon|gal)\b/gi, factor: 4.54609, unit: 'l' },
    { regex: /(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\b)?\s*\b(minim|minims)\b/gi, factor: 0.0616115, unit: 'ml' },
    { regex: /(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\b)?\s*\b(gill|gills)\b/gi, factor: 0.118294, unit: 'l' },
    { regex: /(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\b)?\s*\b(barrel|barrels)\b/gi, factor: 158.987, unit: 'l' },
    { regex: /(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\b)?\s*\b(drop|drops)\b/gi, factor: 0.05, unit: 'ml' },
    // Время
    { regex: /(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\b)?\s*\b(fortnight|fortnights)\b/gi, factor: 14, unit: 'days' },
    // Площадь и другие
    { regex: /(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\b)?\s*\b(rood|roods)\b/gi, factor: 1011.7141, unit: 'm²' },
    { regex: /(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\b)?\s*\b(acre|acres)\b/gi, factor: 4046.86, unit: 'm²' },
    { regex: /(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\b)?\s*\b(twip|twips)\b/gi, factor: 0.0000176389, unit: 'mm' },
    { regex: /(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\b)?\s*\b(thou|thousandth|mil|thous)\b/gi, factor: 0.0254, unit: 'mm' },
    { regex: /(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\b)?\s*\b(barleycorn|barleycorns)\b/gi, factor: 8.47, unit: 'mm' },
    { regex: /(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\b)?\s*\b(hand|hands)\b/gi, factor: 0.1016, unit: 'm' },
    { regex: /(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\b)?\s*\b(cable|cables)\b/gi, factor: 219.456, unit: 'm' },
    { regex: /(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\b)?\s*\b(link|links)\b/gi, factor: 0.201168, unit: 'm' },
    { regex: /(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\b)?\s*\b(slug|slugs)\b/gi, factor: 14.5939, unit: 'kg' },
    { regex: /(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\b)?\s*\b(bushel|bushels)\b/gi, factor: 35.2391, unit: 'l' }
  ];

  for (const { regex, factor, unit } of conversions) {
      converted = converted.replace(regex, (_, value) => {
          const numericValue = value ? value.replace(/,/g, '') : '1';
          const number = parseFloat(numericValue);
          if (isNaN(number)) return value;
          let metricValue = number * factor;

          if (unit === 'mm') {
              return formatWithAdaptivePrecision(metricValue, unit);
          }
          if (unit === 'g' && metricValue >= 1000) {
              metricValue = metricValue / 1000;
              return `${metricValue.toFixed(2)} kg`;
          }
          if (unit === 'm' && metricValue >= 1000) {
              metricValue = metricValue / 1000;
              return `${metricValue.toFixed(2)} km`;
          }
          if (unit === 'l' && metricValue < 1) {
              metricValue = metricValue * 1000;
              return `${metricValue.toFixed(2)} ml`;
          }
          console.log(`Converting ${value} ${unit} to ${metricValue.toFixed(2)} ${unit}`);
          return `${metricValue.toFixed(2)} ${unit}`;
      });
  }

  return converted;
}

let tooltip = null;
let hideTimeout = null;
let isMouseOverTooltip = false;

function isTextSelectedInTooltip() {
  if (!tooltip) return false;
  const selection = window.getSelection();
  if (selection.rangeCount === 0) return false;
  const range = selection.getRangeAt(0);
  return tooltip.contains(range.commonAncestorContainer);
}

function isSelectionInInputWithText() {
  const active = document.activeElement;
  if (!active) return false;
  if (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA') {
      const start = active.selectionStart;
      const end = active.selectionEnd;
      return start !== end;
  }
  return false;
}

function scheduleHideTooltip() {
  clearTimeout(hideTimeout);
  if (isTextSelectedInTooltip() || isMouseOverTooltip || isSelectionInInputWithText()) {
      console.log("Tooltip hide delayed due to selection or mouseover");
      return;
  }
  console.log("Scheduling tooltip hide");
  hideTimeout = setTimeout(() => {
      removeTooltip();
  }, 10);
}

function removeTooltip() {
  if (tooltip) {
      console.log("Removing tooltip");
      tooltip.remove();
      tooltip = null;
  }
}

function showTooltipBelow(rect, text) {
  console.log("Attempting to show tooltip with rect:", rect, "and text:", text);
  if (!rect) return;
  removeTooltip();

  tooltip = document.createElement("div");
  tooltip.textContent = text;

  tooltip.style.position = "absolute";
  tooltip.style.top = `${window.scrollY + (rect.bottom || 0) + 6}px`;
  tooltip.style.left = `${window.scrollX + (rect.left || 0)}px`;
  tooltip.style.padding = "6px 10px";
  tooltip.style.borderRadius = "6px";
  tooltip.style.fontSize = "14px";
  tooltip.style.fontFamily = "sans-serif";
  tooltip.style.zIndex = "100000";
  tooltip.style.maxWidth = "320px";
  tooltip.style.whiteSpace = "pre-wrap";
  tooltip.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
  tooltip.style.userSelect = "text";
  tooltip.style.background = "#ffffcc";

  if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      tooltip.style.background = "#333333";
      tooltip.style.color = "#eeeeee";
      tooltip.style.border = "1px solid #555555";
      tooltip.style.boxShadow = "0 2px 8px rgba(0,0,0,0.7)";
  } else {
      tooltip.style.background = "#ffffcc";
      tooltip.style.color = "#333333";
      tooltip.style.border = "1px solid #999999";
      tooltip.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
  }

  document.body.appendChild(tooltip);
  console.log("Tooltip appended to body");

  tooltip.addEventListener("mouseenter", () => {
      isMouseOverTooltip = true;
      clearTimeout(hideTimeout);
      console.log("Mouse entered tooltip");
  });

  tooltip.addEventListener("mouseleave", () => {
      isMouseOverTooltip = false;
      scheduleHideTooltip();
      console.log("Mouse left tooltip");
  });
}

document.addEventListener("selectionchange", () => {
  const selection = window.getSelection();
  if (selection.toString().trim().length === 0) {
      console.log("Selection cleared, scheduling hide");
      scheduleHideTooltip();
  }
});