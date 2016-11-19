import React from 'react';
import isBrowser from 'is-in-browser';
import objectWithoutProperties from 'babel-runtime/helpers/objectWithoutProperties';

const __DEV__ = process.env.NODE_ENV !== 'production';

// Pixel ratios within this number are considered to be equal
const EPSILON = 1e-5;

const kSVGElement = Symbol('svgElement');
const kMediaQueryList = Symbol('mediaQueryList');
const kCtx = Symbol('ctx');
const kCanvas = Symbol('canvas');

// Takes an SVG string and outputs a Promise<Image>
function svgToImage(svg) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const blob = new Blob([svg], {type: 'image/svg+xml'});
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      const err = new Error('Unable to load SVG');
      err.image = img;
      reject(err);
    };
    img.src = url;
  });
}

const mediaQuery = scaleFactor =>
  `screen and (resolution: ${scaleFactor}dppx)`;
const emptySvg = (w, h) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"></svg>`;

export default class HybridCanvas extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      scaleFactor: isBrowser && window.devicePixelRatio || 1
    };
  }

  static defaultProps = {
    width: 300,
    height: 150,
    imageSmoothingEnabled: true,
    imageSmoothingQuality: 'high',
    autoScale: true
  };

  _mediaQueryListener = e => {
    if (!e.match) {
      this[kMediaQueryList].removeListener(this._mediaQueryListener);
      this.setState({
        scaleFactor: window.devicePixelRatio
      });
      this._listenMediaQuery();
      this.props.onRatioChange &&
        this.props.onRatioChange(window.devicePixelRatio);
    }
  };

  _listenMediaQuery = () => {
    this[kMediaQueryList] = window.matchMedia(mediaQuery(this.state.scaleFactor));
    this[kMediaQueryList].addListener(this._mediaQueryListener);
  };

  _getImage = async () => {
    if (this.props.svgString) {
      return await svgToImage(this.props.svgString);
    } else {
      const {width, height} = this.props;
      const svgString = this[kSVGElement] ?
        this[kSVGElement].outerHTML :
        emptySvg(width, height);
      return await svgToImage(svgString);
    }
  };

  redraw = async (ctx, scaleFactor) => {
    ctx = ctx || this[kCtx];
    scaleFactor = scaleFactor || this.state.scaleFactor;

    const s = num => num * scaleFactor;

    const {
      width,
      height,
      predraw,
      draw
    } = this.props;
    let {
      drawDimensions = [0, 0, width, height]
    } = this.props;

    drawDimensions = drawDimensions.map((n, i, d) =>
      d.length <= 4 || i >= 4 ? s(n) : n
    );

    predraw && predraw(ctx, scaleFactor);
    const img = await this._getImage();
    ctx.drawImage(img, ...drawDimensions);
    draw && draw(ctx, scaleFactor);
  };

  toBlob = async (scaleFactor = 1) => {
    let canvas = this[kCanvas];

    if (Math.abs(this.state.scaleFactor - scaleFactor) > EPSILON) {
      canvas = document.createElement('canvas');
      canvas.setAttribute('width', w);
      canvas.setAttribute('height', h);
      const ctx = canvas.getContext('2d');
      await this.redraw(ctx, scaleFactor);
    }

    return await new Promise(resolve => {
      canvas.toBlob(resolve);
    });
  };

  get canvas() {
    return this[kCanvas];
  }

  get ctx() {
    return this[kCtx];
  }

  render() {
    const {scaleFactor} = this.state;
    const s = num => num * scaleFactor;
    const {
      width,
      height,
      svgString,
      svgElement
    } = this.props;

    let img = null;
    if (svgString) {
      // noop
    } else if (svgElement) {
      img = React.cloneElement(svgElement, {
        hidden: true,
        style: {
          // does not clone original style as this element is hidden anyway
          display: 'none !important'
        },
        ref: node => this[kSVGElement] = node
      });
    }

    return <div>
      <canvas
        width={s(width)}
        height={s(height)}
        ref={node => this[kCanvas] = node}
        {...objectWithoutProperties(this.props, [
          'width', 'height', 'imageSmoothingEnabled', 'imageSmoothingQuality',
          'autoScale', 'drawDimensions', 'predraw', 'draw', 'onRatioChange',
          'svgString', 'svgElement'
        ])}
      />
      {img}
    </div>;
  }

  componentDidMount() {
    this[kCtx] = this[kCanvas].getContext('2d');
    this[kCtx].imageSmoothingEnabled = this.props.imageSmoothingEnabled;
    this[kCtx].imageSmoothingQuality = this.props.imageSmoothingQuality;
    if (this.props.autoScale) {
      this._listenMediaQuery();
    }
    this.redraw();
  }

  componentDidUpdate(prev) {
    const {
      autoScale,
      imageSmoothingEnabled,
      imageSmoothingQuality
    } = this.props;
    this[kCtx].imageSmoothingEnabled = imageSmoothingEnabled;
    this[kCtx].imageSmoothingQuality = imageSmoothingQuality;
    if (prev.autoScale !== autoScale) {
      if (autoScale) {
        this._listenMediaQuery();
      } else {
        this[kMediaQueryList].removeListener(this._mediaQueryListener);
        this[kMediaQueryList] = null;
      }
    }
    this.redraw();
  }
}

if (__DEV__) {
  // Remember to update objectWithoutProperties above as well
  HybridCanvas.propTypes = {
    width: React.PropTypes.number.isRequired,
    height: React.PropTypes.number.isRequired,
    imageSmoothingEnabled: React.PropTypes.bool,
    imageSmoothingQuality: React.PropTypes.string,

    autoScale: React.PropTypes.bool,
    drawDimensions: React.PropTypes.arrayOf(React.PropTypes.number),
    predraw: React.PropTypes.func,
    draw: React.PropTypes.func,
    onRatioChange: React.PropTypes.func,

    svgString: React.PropTypes.string,
    svgElement: React.PropTypes.element
  };
}
