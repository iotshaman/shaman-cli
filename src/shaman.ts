#!/usr/bin/env node
import { Invoke } from ".";

/* istanbul ignore next */
(function() { 
  Invoke(process.argv.slice(2)).catch(ex => {
    console.error(ex);
  });
})();