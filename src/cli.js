#!/usr/bin/env node
"use strict";

const minimist = require("minimist");
const ora = require("ora");
const chalk = require("chalk");

const unitGolf = require("./index");

const args = minimist(
  process.argv.slice(2),
  {
    alias: {
      t: "tolerance",
      w: "width",
      h: "height",
      s: "short"
    },
    default: {
      tolerance: 0.2,
      width: 400,
      height: 300,
      short: false
    }
  }
);

const {
  _: input,
  tolerance,
  width,
  height,
  short
} = args;

const isMulti = input.length > 1;
let longestInput = isMulti ? Math.max(...input.map(i => i.toString().length)) : 0;

const spinner = ora();
spinner.start();

const renderOffset = offset => {
  if (offset === 0) return "";
  return `(${(offset > 0 ? "+" : "") + offset}px)`;
};

const renderBest = option => {
  const { string, pixelOffset } = option;
  return [
    chalk.hex("#8bc34a").bold(`⛳  ${string}`),
    chalk.green(renderOffset(pixelOffset))
  ].join(" ");
};

const renderRest = option => {
  const { string, pixelOffset } = option;
  return [string, renderOffset(pixelOffset)].join(" ").trimEnd();
};

const renderRestColumns = values => {
  const termWidth = process.stdout.columns || 80;
  const maxLength = Math.max(...values.map(v => v.length)) + 1;
  const columns = Math.max(1, Math.floor(termWidth / (maxLength)));
  return values
    .reduce(
      (acc, v, i) => {
        if (i % columns === 0) {
          acc.push([]);
        }
        acc[acc.length - 1].push(v.trimEnd().padEnd(maxLength));
        return acc;
      },
      []
    )
    .map(line => line.join(""))
    .join("\n");
};

Promise
  .all(
    input
      .map(item => item.toString())
      .map(
        input => unitGolf({ input, tolerance, width, height }).then(([best, ...rest]) => ({
            input,
            best: renderBest(best),
            rest: short ? undefined : renderRestColumns(rest.map(renderRest))
          })
        )
      )
  )
  .then(results => {
    spinner.stop();
    results.forEach(({ input, best, rest }) => {
      console.log(
        isMulti ? `${chalk.hex("#bfc34a").bold(input.padStart(longestInput))} =>` : "",
        best
      );

      if (!short) {
        console.log(`\n${rest}\n`);
      }
    });
  });
