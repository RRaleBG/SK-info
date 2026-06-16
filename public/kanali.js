import { loadM3U } from "./m3u-parser.js";
import { renderChannels } from "./channels.js";

loadM3U("./kanali.m3u").then(renderChannels);
