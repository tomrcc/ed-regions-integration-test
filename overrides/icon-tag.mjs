import { evalToken, Tokenizer, toPromise } from "liquidjs";

export default function iconTagFactory(_liquidEngine) {
  return {
    parse(tagToken) {
      const tokenizer = new Tokenizer(
        tagToken.args,
        this.liquid.options.operatorsTrie,
      );
      this.nameToken = tokenizer.readValue();
      if (!this.nameToken) throw new Error("icon: missing name argument");
    },
    async render(context) {
      const name = await toPromise(evalToken(this.nameToken, context));
      return `<span class="icon icon-${name}" aria-hidden="true"></span>`;
    },
  };
}
