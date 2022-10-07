#!/usr/bin/env node
import { Invoke } from "./cli";

/* istanbul ignore next */
(function() { 
  Invoke(process.argv).catch(ex => {
    console.error(ex);
  });
})();
