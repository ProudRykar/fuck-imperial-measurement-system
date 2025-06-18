document.addEventListener("mouseup", () => {
    const selection = window.getSelection();
    const text = selection.toString().trim();
  
    if (text.length > 0) {
      const converted = convertImperialToMetric(text);
      if (converted !== text) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        showTooltipBelow(rect, converted);
      }
    }
  });

  function convertImperialToMetric(text) {
    
    const troyConversions = [
      {
        regex: /(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\b)?\s*\b(troy ounces|troy ounce|ozt|oz t)\b/gi,
        convert: value => {
          const numericValue = value && value.trim() !== '' ? value.replace(/,/g, '') : '1';
          const inNumber = parseFloat(numericValue);
          const grams = inNumber * 31.1035;  // 1 troy ounce = 31.1035 g
          if (grams >= 1000) {
            return `${(grams / 1000).toFixed(2)} kg`;
          }
          return ` ${grams.toFixed(2)} g`;
        }
      },
      {
        regex: /(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\b)?\s*\b(troy pounds|troy pound|lb t|lb troy)\b/gi,
        convert: value => {
          const numericValue = value && value.trim() !== '' ? value.replace(/,/g, '') : '1';
          const inNumber = parseFloat(numericValue);
          const grams = inNumber * 373.2417;  // 1 troy pound = 373.2417 g
          if (grams >= 1000) {
            return `${(grams / 1000).toFixed(2)} kg`;
          }
          return ` ${grams.toFixed(2)} g`;
        }
      }
    ];
    
    const pressureConversions = [
      {
        regex: /(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\b)?\s*\b(inches of mercury|inch of mercury|inHg|in Hg)\b/gi,
        convert: value => {
          const inHgValue = parseFloat(value);
          const mmHg = (inHgValue * 25.4).toFixed(2);            // 1 inch Hg = 25.4 mm Hg
          const pascal = (inHgValue * 3386.39).toFixed(1);       // 1 inch Hg = 3386.39 Па
          return `${mmHg} mmHg (${pascal} Pa)`;
        }
      },
    ];
  
    let converted = text;

    // Height shit
    converted = converted.replace(/(\d{1,2})\s*[′']\s*(\d{1,2})?\s*(?:["″])?/g, (match, feetStr, inchStr) => {
      const feet = parseInt(feetStr, 10);
      const inches = inchStr ? parseInt(inchStr, 10) : 0;

      if (isNaN(feet) || isNaN(inches)) return match;

      const totalInches = feet * 12 + inches;
      const cm = (totalInches * 2.54).toFixed(2);
      return `${cm} cm`;
    });
  
    const tempRegex = /(-?\d+(?:\.\d+)?)\s*(°F|Fahrenheit|° Fahrenheit|°Fahrenheit)\b/gi;
    converted = converted.replace(tempRegex, (_, value) => {
      const f = parseFloat(value);
      const c = ((f - 32) * 5 / 9).toFixed(2);
      return `${c}°C`;
    });
  
    for (const { regex, convert } of pressureConversions) {
      converted = converted.replace(regex, (_, value) => convert(value));
    }

    for (const { regex, convert } of troyConversions) {
      converted = converted.replace(regex, (_, value) => convert(value));
    }
  
    const conversions = [
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
      { regex: /(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\b)?\s*\b(fluid ounces|fluid ounce|fl oz)\b/gi, factor: 28.4131, unit: 'ml' },
      { regex: /(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\b)?\s*\b(pints|pint|pt)\b/gi, factor: 0.568261, unit: 'l' },
      { regex: /(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\b)?\s*\b(quarts|quart|qt)\b/gi, factor: 1.13652, unit: 'l' },
      { regex: /(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\b)?\s*\b(gallons|gallon|gal)\b/gi, factor: 4.54609, unit: 'l' },
      { regex: /(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\b)?\s*\b(cubic inch(?:es)?|cu in|in³)\b/gi, factor: 16.387064, unit: 'cm³' },
      { regex: /(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\b)?\s*\b(cubic foot|cubic feet|cu ft|ft³)\b/gi, factor: 0.0283168, unit: 'm³' },
      { regex: /(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\b)?\s*\b(minim|minims)\b/gi, factor: 0.0616115, unit: 'ml' },
      { regex: /(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\b)?\s*\b(gill|gills)\b/gi, factor: 0.118294, unit: 'l' },
      { regex: /(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\b)?\s*\b(barrel|barrels)\b/gi, factor: 158.987, unit: 'l' },
      { regex: /(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\b)?\s*\b(drop|drops)\b/gi, factor: 0.05, unit: 'ml' },
  
      // Время
      { regex: /(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\b)?\s*\b(fortnight|fortnights)\b/gi, factor: 14, unit: 'days' },

      { regex: /(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\b)?\s*\b(troy ounces|troy ounce|ozt|oz t)\b/gi, factor: 31.1035, unit: 'g' },
      { regex: /(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\b)?\s*\b(troy pounds|troy pound|lb t|lb troy)\b/gi, factor: 373.2417, unit: 'g' }
    ];
  
    for (const { regex, factor, unit } of conversions) {
      converted = converted.replace(regex, (_, value) => {
        let numericValue = value ? value.replace(/,/g, '') : null;

        let number = numericValue && numericValue.trim() !== '' ? parseFloat(numericValue) : 1;
        let metricValue = number * factor;
    
        if (unit === 'g' && metricValue >= 1000) {
          metricValue = (metricValue / 1000).toFixed(2);
          return `${metricValue} kg`;
        }
        if (unit === 'l' && metricValue < 1) {
          metricValue = (metricValue * 1000).toFixed(2);
          return `${metricValue} ml`;
        }
        if (number == 1) {
          return ` ${metricValue.toFixed(2)} ${unit}`;
        }
        return `${metricValue.toFixed(2)} ${unit}`;
      });
    }
  
    return converted;
  }
  
  let tooltip = null;
  let hideTimeout = null;
  
  document.addEventListener("mouseup", () => {
    const selection = window.getSelection();
    const text = selection.toString().trim();
  
    if (text.length > 0) {
      const converted = convertImperialToMetric(text);
      if (converted !== text) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        showTooltipBelow(rect, converted);
      } else {
        scheduleHideTooltip();
      }
    } else {
      scheduleHideTooltip();
    }
  });
  
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
  
    const selection = window.getSelection();
    const hasSelection = selection.toString().trim().length > 0;
  
    if (hasSelection || isTextSelectedInTooltip() || isMouseOverTooltip || isSelectionInInputWithText()) {
      return;
    }
  
    hideTimeout = setTimeout(() => {
      removeTooltip();
    }, 10);
  }
  
  
  function removeTooltip() {
    if (tooltip) {
      tooltip.remove();
      tooltip = null;
    }
  }
  
  let isMouseOverTooltip = false;
  
  function showTooltipBelow(rect, text) {
    removeTooltip();
  
    tooltip = document.createElement("div");
    tooltip.textContent = text;
  
    // Стили
    tooltip.style.position = "absolute";
    tooltip.style.top = `${window.scrollY + rect.bottom + 6}px`;
    tooltip.style.left = `${window.scrollX + rect.left}px`;
    tooltip.style.padding = "6px 10px";
    tooltip.style.borderRadius = "6px";
    tooltip.style.fontSize = "14px";
    tooltip.style.fontFamily = "sans-serif";
    tooltip.style.zIndex = "100000";
    tooltip.style.maxWidth = "320px";
    tooltip.style.whiteSpace = "pre-wrap";
    tooltip.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
    tooltip.style.userSelect = "text";
  
    // Цвета по теме
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
  
    tooltip.addEventListener("mouseenter", () => {
      isMouseOverTooltip = true;
      clearTimeout(hideTimeout);
    });
  
    tooltip.addEventListener("mouseleave", () => {
      isMouseOverTooltip = false;
      scheduleHideTooltip();
    });
  }
  
  document.addEventListener("selectionchange", () => {
    const selection = window.getSelection();
    if (selection.toString().trim().length === 0) {
      scheduleHideTooltip();
    }
  });
  