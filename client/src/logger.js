"use strict";

const colorByLevels = {
  INF: {
    begin: "\x1b[32m",
    end: "\x1b[0m",
  },
  ERR: {
    begin: "\x1b[31m",
    end: "\x1b[0m",
  },
};

function _makeMessage(level, pingData, message) {
  return `${
    colorByLevels[level].begin
  }[${new Date().toISOString()} ${level} for pingId:${pingData.pingId
    .toString()
    .padStart(3)} / attempt:${pingData.deliveryAttempt
    .toString()
    .padStart(3)}]${colorByLevels[level].end} ${message}`;
}

function info(pingData, message) {
  console.log(_makeMessage("INF", pingData, message));
}

function error(pingData, message) {
  console.log(_makeMessage("ERR", pingData, message));
}

module.exports = { info, error };
