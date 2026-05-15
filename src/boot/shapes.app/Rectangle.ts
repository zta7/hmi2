import * as joint from "@clientio/rappid";

const toFormatted = (raw: string, format: string): string => {
  if ((window as any).online) return raw
  if (!raw && raw !== '0') return raw
  const num = parseInt(raw, 10)
  if (isNaN(num) || num.toString() !== raw.toString().trim()) return raw
  if (format === 'bin') return num.toString(2)
  if (format === 'hex') return '0x' + num.toString(16).toUpperCase()
  return raw
}

export class Rectangle extends joint.shapes.standard.Rectangle {
  defaults() {
    return {
      ...super.defaults,
      fills: [],
      type: "app.Rectangle",
      format: 'dec',
    };
  }

  initialize(...args: any[]) {
    super.initialize.call(this, ...args);
  }
}

export const RectangleView = joint.dia.ElementView.extend({
  initFlag: ["RENDER", "RESIZE", "TRANSFORM", "UPDATE_TEXT"],

  presentationAttributes: {
    size: ["RESIZE"],
    position: ["TRANSFORM"],
    angle: ["TRANSFORM"],
    attrs: ["UPDATE_TEXT"],
    format: ["UPDATE_TEXT"],
  },

  initialize(..._args: any[]) {
    (joint.dia.ElementView.prototype.initialize as any).apply(this, _args);
  },

  updateText() {
    const foEl = this.el.querySelector("foreignObject");
    if (!foEl) return;

    const rawText = this.model.attr("label/text") || "";
    const format = this.model.get("format") || "dec";
    const text = toFormatted(rawText, format);
    console.log('[Rectangle updateText]', { rawText, format, text, modelFormat: this.model.get("format") });
    const labelFill =
      this.model.attr("label/fill") ||
      this.model.attr("label/stroke") ||
      "#e0e0e0";
    const fontSize = this.model.attr("label/fontSize");
    const fontWeight = this.model.attr("label/fontWeight");

    const span = foEl.querySelector("span");
    if (span) {
      span.textContent = text;
      span.style.color = labelFill;
      if (fontSize != null) {
        span.style.fontSize = `${fontSize}px`;
      } else {
        span.style.fontSize = "";
      }
      if (fontWeight != null) {
        span.style.fontWeight = String(fontWeight);
      } else {
        span.style.fontWeight = "";
      }
    }
  },

  render() {
    const { model } = this;
    const { util } = joint;

    const size = model.size();
    const rawText = model.attr("label/text") || "";
    const format = model.get("format") || "dec";
    const text = toFormatted(rawText, format);
    console.log('[Rectangle render]', { rawText, format, text, modelFormat: model.get("format"), allKeys: Object.keys(model.attributes) });
    const labelFill =
      model.attr("label/fill") ||
      model.attr("label/stroke") ||
      "#e0e0e0";
    const fontSize = model.attr("label/fontSize");
    const fontWeight = model.attr("label/fontWeight");
    const bodyFill = model.attr("body/fill") || "#2a2a3e";
    const bodyStroke = model.attr("body/stroke") || "#555577";
    const bodyStrokeWidth = model.attr("body/strokeWidth") || 1;
    const bodyRx = model.attr("body/rx") || 0;
    const bodyRy = model.attr("body/ry") || 0;

    const rect = {
      tagName: "rect",
      selector: "body",
      attributes: {
        fill: bodyFill,
        stroke: bodyStroke,
        "stroke-width": bodyStrokeWidth,
        rx: bodyRx,
        ry: bodyRy,
        width: size.width,
        height: size.height,
      },
    };

    const foreignObject = {
      tagName: "foreignObject",
      selector: "foreignObject",
      attributes: {
        overflow: "hidden",
        x: 4,
        y: 4,
      },
    };

    const markup = [rect, foreignObject];

    const doc = util.parseDOMJSON(markup);
    this.body = doc.selectors.body;
    this.el.innerHTML = "";
    this.el.appendChild(doc.fragment);

    this.updateSize();

    const foEl = this.el.querySelector("foreignObject");
    if (foEl) {
      foEl.innerHTML = "";
      const div = document.createElementNS(
        "http://www.w3.org/1999/xhtml",
        "div"
      );
      div.style.display = "flex";
      div.style.alignItems = "center";
      div.style.justifyContent = "center";
      div.style.width = "100%";
      div.style.height = "100%";
      div.style.overflow = "hidden";

      const span = document.createElementNS(
        "http://www.w3.org/1999/xhtml",
        "span"
      );
      span.textContent = text;
      Object.assign(span.style, {
        display: "inline-block",
        width: "100%",
        textAlign: "center",
        wordBreak: "break-all",
        overflowWrap: "break-word",
        whiteSpace: "normal",
        color: labelFill,
      });
      if (fontSize != null) span.style.fontSize = `${fontSize}px`;
      if (fontWeight != null) span.style.fontWeight = String(fontWeight);

      div.appendChild(span);
      foEl.appendChild(div);
    }

    this.translate();
    return this;
  },

  confirmUpdate(flags: number, opt: any) {
    if (this.hasFlag(flags, "RENDER")) this.render();
    if (this.hasFlag(flags, "RESIZE")) {
      this.updateSize();
      this.resize(opt);
    }
    if (this.hasFlag(flags, "TRANSFORM")) this.updateTransformation();
    if (this.hasFlag(flags, "UPDATE_TEXT")) this.updateText();
  },

  updateSize() {
    const foreignObject = this.vel.findOne("foreignObject");
    if (!foreignObject) return;
    const size = this.model.size();
    foreignObject.setAttribute("width", String(size.width - 8));
    foreignObject.setAttribute("height", String(size.height - 8));
    const bodyRect = this.vel.findOne("rect");
    if (bodyRect) {
      bodyRect.setAttribute("width", String(size.width));
      bodyRect.setAttribute("height", String(size.height));
    }
  },
});
