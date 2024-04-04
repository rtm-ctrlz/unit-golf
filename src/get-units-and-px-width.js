"use strict";

const puppeteer = require("puppeteer");

const UNITS = [
  "px",
  "vw",
  "vh",
  "in",
  "cm",
  "mm",
  "pt",
  "pc",
  "em",
  "ex",
  "q",
  "ch"
];

const measureUnits = (value, units) => {
  const el = document.createElement("div");
  document.body.appendChild(el);
  const sign = value[0] === "-" ? -1 : 1;
  let valueAbs = sign < 0 ? value.slice(1) : value;

  const measureEl = widthValue => {
    el.setAttribute("style", `width:${widthValue}`);
    const { width } = el.getBoundingClientRect();
    el.removeAttribute("style");
    return width;
  };

  const initialWidth = measureEl(valueAbs);

  return {
    pxWidth: sign * initialWidth,
    units: units.map(unit => {
      const measured = measureEl(`${initialWidth}${unit}`);
      return {
        name: unit,
        multiplier: measured / initialWidth
      };
    }, [])
  };
};

const getUnits = ({ input, width, height }) => {
  return puppeteer.launch()
    .then(browser => browser.newPage())
    .then(page => page.setViewport({ width, height }).then(() => page))
    .then(page => page.evaluate(measureUnits, input, UNITS).then(units => page.browser().close().then(() => units)));
};

module.exports = getUnits;
