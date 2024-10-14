const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "test",
    aliases: ["flux", "flux-dev", "nsfw", "reality", "sdxl", "anime", "realism", "photoreal"],
    author: "Redwan",
    version: "1.4",
    cooldowns: 20,
    role: 0,
    shortDescription: "Generate an image using various APIs.",
    longDescription: "Generates an image using the provided prompt with different APIs including Flux, Flux-Dev, NSFW, Reality, SDXL, and others.",
    category: "fun",
    guide: "{p}imagegen <model> <prompt>\n\nExample: {p}imagegen anime A beautiful sunset"
  },
  onStart: async function ({ message, args, api, event }) {
    const command = args[0];
    const prompt = args.slice(1).join(" ");

    // Available generators and their models
    const availableGenerators = {
      flux_1_schnell: "Generates images using the flux_1_schnell model.",
      flux_1_dev: "Generates images using the flux_1_dev model.",
      flux_koda: "Generates images using the flux_koda model.",
      softserve_anime: "Generates anime images using the softserve_anime model.",
      flux_realismlora: "Generates images using the flux_realismlora model.",
      animagine_xl_3_1: "Generates images using the animagine_xl_3_1 model.",
      flux_aestheticanime: "Generates aesthetic anime images using the flux_aestheticanime model.",
      stable_diffusion_xl_base_1_0: "Generates images using the stable_diffusion_xl_base_1_0 model.",
      dark_fantasy_illustration_flux: "Generates dark fantasy illustrations using the dark_fantasy_illustration_flux model.",
      stable_diffusion_3_medium_diffusers: "Generates images using the stable_diffusion_3_medium_diffusers model.",
      mklan_xxx_nsfw_pony: "Generates NSFW images using the mklan_xxx_nsfw_pony model.",
      flux_dev_panorama_lora_2: "Generates panorama images using the flux_dev_panorama_lora_2 model.",
      flux_ghibsky_illustration: "Generates ghibsky illustrations using the flux_ghibsky_illustration model.",
      nsfw_xl: "Generates NSFW images using the nsfw_xl model.",
      dreamlike_photoreal_2_0: "Generates photorealistic images using the dreamlike_photoreal_2_0 model.",
      newrealityxl_global_nsfw: "Generates global NSFW images using the newrealityxl_global_nsfw model.",
      flux_lego_lora_dreambooth: "Generates lego dreambooth images using the flux_lego_lora_dreambooth model.",
      text_to_image: "Generates images from text using the text_to_image model.",
      sdxl_lora_slider_2000s_indie_comic_art_style: "Generates comic art style images using the sdxl_lora_slider_2000s_indie_comic_art_style model.",
      flux_lora_cute_korean_girl: "Generates images of cute Korean girls using the flux_lora_cute_korean_girl model.",
      red_cinema: "Generates cinema images using the red_cinema model.",
      flux_film_foto: "Generates film photo images using the flux_film_foto model.",
      testscg_anatomy_flux1: "Generates anatomical images using the testscg_anatomy_flux1 model.",
      flux_cinestill: "Generates cinestill images using the flux_cinestill model.",
      insanerealistic_v1: "Generates realistic images using the insanerealistic_v1 model.",
      flux_y2k: "Generates Y2K style images using the flux_y2k model.",
      flux_80s_cyberpunk: "Generates 80s cyberpunk images using the flux_80s_cyberpunk model."
    };

    // Show available generators if no command is provided or if `help` is requested
    if (!command || command === "help") {
      const generatorList = Object.keys(availableGenerators)
        .map(cmd => `${cmd}: ${availableGenerators[cmd]}`)
        .join("\n");
      return api.sendMessage(`Available generators:\n${generatorList}`, event.threadID);
    }

    // Validate command and prompt
    if (!Object.keys(availableGenerators).includes(command)) {
      return api.sendMessage("❌ | Invalid command. Use `imagegen help` to see available generators.", event.threadID);
    }

    if (!prompt) {
      return api.sendMessage("❌ | You need to provide a prompt.", event.threadID);
    }

    api.sendMessage("Please wait, we're making your picture...", event.threadID, event.messageID);

    // Determine API URL
    const apiUrl = `https://redwans-apis.onrender.com/api/gen?prompt=${encodeURIComponent(prompt)}&apikey=redwan&model=${command}`;

    try {
      console.log(`Requesting URL: ${apiUrl}`);

      // Fetch image from API
      const response = await axios.get(apiUrl, { responseType: "arraybuffer" });
      console.log("API response received");

      // Prepare directory and file path for caching
      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir);
      }

      // Ensure image path is valid
      const imagePath = path.join(cacheDir, `${Date.now()}_${command}_image.png`);
      if (typeof imagePath !== 'string') {
        throw new Error("Invalid image path");
      }

      fs.writeFileSync(imagePath, Buffer.from(response.data, "binary"));
      console.log(`Image saved at: ${imagePath}`);

      // Send image to the user
      const imageStream = fs.createReadStream(imagePath);
      api.sendMessage({
        body: "Here is your generated image:",
        attachment: imageStream
      }, event.threadID);
      console.log("Image sent");
    } catch (error) {
      console.error("Error:", error);
      api.sendMessage("❌ | An error occurred. Please try again later.", event.threadID);
    }
  }
};
 
