# react-hybrid-canvas

React component for scalable canvases backed by SVGs.

Oftentimes one would want to import an SVG into an HTML canvas, in order to do
further raster processing with it. In React, this can be easily accomplished
with refs and lifecycle methods that run after the DOM is updated. However, the
drawback with such an approach is that since canvas operates upon bitmap, the
key benefit of using SVG – the ability to scale according to device pixel
density – is gone.

This React component solves the scaling problem, first by scaling the canvas
using [`devicePixelRatio`] when the component is mounted initially, and second
by listening for pixel ratio changes using [`matchMedia`] and [`resolution`]
CSS media query (with [`dppx`] units), in order to redraw the canvas
automatically when a change is detected (e.g. when the user zooms in, or when
the window is moved to another display).

## Props

The following explicitly declared props apply to the underlying canvas. If you
pass a prop that is not documented below, it will be passed along to the
canvas anyway.

- `width`, `height` [`Number`]: Base dimensions of the canvas. The actual
  canvas size will be scaled according to [`devicePixelRatio`]. **Default:**
  `300`×`150`.
- `imageSmoothingEnabled` [`Boolean`]: Whether or not image smoothing is to be
  enabled when rendering SVG image to the canvas. This is directly mapped to
  [`CanvasRenderingContext2D`]'s [`imageSmoothingEnabled`] parameter.
  **Default:** `true`.
- `imageSmoothingQuality` [`String`]: Quality of image smoothing
  when rendering SVG image to the canvas. This is directly mapped to
  [`CanvasRenderingContext2D`]'s [`imageSmoothingQuality`] parameter.
  **Default:** `'high'`.

These props control behaviors of this React component.

- `autoScale` [`Boolean`]: Listen for device pixel ratio changes and
  automatically rescale the canvas to accomodate. **Default:** `true`.
- `drawDimensions` <code>[Array]&lt;[Number]></code>: Unscaled dimensions
  passed to [`drawImage`], as an array of numbers. This component will
  automatically scale the actual dimensions used based on the current pixel
  ratio. The two-argument signature for [`drawImage`] is not supported as it
  does not support scaling. **Default:** `[0, 0, width, height]`, where `width`
  and `height` correspond to the props which fills the entire canvas.
- `predraw` [`Function`]: This function is called every time a redraw is
  requested, *before* the SVG has already been drawn. It has the signature
  `(ctx, scaleFactor)` where `ctx` is a [`CanvasRenderingContext2D`] associated
  with the canvas, and `scaleFactor` is a [`Number`] representing the requested
  scale.
- `draw` [`Function`]: This function is called every time a redraw is
  requested, *after* the SVG has already been drawn. It has the signature
  `(ctx, scaleFactor)` where `ctx` is a [`CanvasRenderingContext2D`] associated
  with the canvas, and `scaleFactor` is a [`Number`] representing the requested
  scale. **Here is where you can do extra processing on the SVG canvas.**
- `onRatioChange` [`Function`]: This function is called when the scale factor
  for the canvas changes due to changing device pixel ratio. It has the
  signature `(scaleFactor)`, where `scaleFactor` is equal to the current value
  of [`devicePixelRatio`].

The SVG used in rendering can be supplied in two ways. If both are specified,
`svgString` takes precedence. If neither is specified, an empty SVG is used as
the default.

- `svgString` [`String`]: SVG to be rendered on the canvas as a string. This is
  the preferred method when the SVG is entirely static.
- `svgElement` [`ReactElement`]: SVG to be rendered on the canvas as
  a React element.

## Instance properties

If you get a ref of the `HybridCanvas` element, you will be able to access the
following properties and methods.

### Properties

- `canvas` [`HTMLCanvasElement`]: The underlying canvas DOM object.
- `ctx` [`CanvasRenderingContext2D`]: The 2D rendering context associated with
  `canvas`.

### Methods

- `toBlob` <code>(scaleFactor: [Number]) → [Promise]&lt;[Blob]></code>: Convert
  the canvas to an image Blob, scaled at the provided `scaleFactor`. This uses
  the [`toBlob`] method of an [`HTMLCanvasElement`], but since the requested
  `scaleFactor` may be different from the actual one of the `canvas` property,
  a temporary canvas may be used.

[`matchMedia`]: https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia
[`resolution`]: https://developer.mozilla.org/en-US/docs/Web/CSS/Media_Queries/Using_media_queries#resolution
[`dppx`]: https://developer.mozilla.org/en-US/docs/Web/CSS/resolution#dppx
[`devicePixelRatio`]: https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio
[`HTMLCanvasElement`]: https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement
[`toBlob`]: https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob
[CanvasRenderingContext2D]: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D
[`CanvasRenderingContext2D`]: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D
[`imageSmoothingEnabled`]: https://html.spec.whatwg.org/multipage/scripting.html#image-smoothing:dom-context-2d-imagesmoothingenabled
[`imageSmoothingQuality`]: https://html.spec.whatwg.org/multipage/scripting.html#image-smoothing:dom-context-2d-imagesmoothingquality
[`drawImage`]: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage
[Blob]: https://developer.mozilla.org/en-US/docs/Web/API/Blob
[`ReactElement`]: https://facebook.github.io/react/docs/rendering-elements.html
[Number]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Number_type
[`Number`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Number_type
[`Boolean`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Boolean_type
[`String`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type
[`Function`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function
[Array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array
[Promise]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
