export class SourceFile {

  lines: LineDetail[];

  replaceLines = (index: number, lineFactory: () => LineDetail[]) => {
    let newLines = lineFactory();
    let before = this.lines.slice(0, index);
    let after = this.lines.slice(index);
    let lines = [...before, ...newLines, ...after];
    this.lines = lines.map((l, i) => {
      l.index = i;
      return l;
    });
  }

  toString(): string {
    return this.lines.reduce((a, b) => {
      if (!b.generated) return `${a}${b.line}`;
      return `${a}${" ".repeat(b.indent)}${b.line}\r\n`
    }, '');
  }

  get transformationLines(): LineDetail[] {
    if (!this.lines) return [];
    return this.lines
      .filter(l => !!l.lifecycleHook)
      .filter(l => l.lifecycleHookData.lifecycle == "transformation");
  }

}

export class LineDetail {
  index: number;
  line: string;
  indent: number;
  lifecycleHook: boolean;
  generated?: boolean;
  constructor(seed?: LineDetailSeed) {
    if (!!seed) Object.assign(this, seed);
  }

  get lifecycleHookData(): {lifecycle: string, args: any} {
    if (!this.lifecycleHook) return {lifecycle: "none", args: {}};
    try {
      return JSON.parse(this.line.replace("//shaman:", "").trim());
    } catch(_ex) {
      return {lifecycle: "none", args: {}};
    }
  }
}

interface LineDetailSeed {
  index: number;
  line: string;
  indent: number;
  lifecycleHook: boolean;
  generated?: boolean;
}