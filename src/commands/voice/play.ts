import { bot } from "../../../cache.ts";
import { createCommand } from "../../utils/helpers.ts";
import {
  addPlaylistToQueue,
  addSoundToQueue,
  validURL,
} from "../../utils/voice.ts";

createCommand({
  name: "play",
  guildOnly: true,
  arguments: [{ type: "...string", name: "query", required: true }],
  async execute(message, args) {
    const player = await bot.lavadenoManager.players.get(
      message.guildId.toString(),
    );

    if (!player) {
      const voiceState = message.guild?.voiceStates.get(message.authorId);
      if (!voiceState?.channelId) {
        return message.reply(`You first need to join a voice channel!`);
      }

      const newPlayer = bot.lavadenoManager.create(message.guildId.toString());
      await newPlayer.connect(voiceState.channelId.toString(), {
        selfDeaf: true,
      });

      await message.reply(`Successfully joined the channel!`);
    }

    const trackSearch = validURL(args.query)
      ? args.query
      : `ytsearch:${args.query}`;
    const result = await bot.lavadenoManager.search(trackSearch);

    switch (result.loadType) {
      case "TRACK_LOADED":
      case "SEARCH_RESULT": {
        return addSoundToQueue(message, result.tracks[0]);
      }
      case "PLAYLIST_LOADED": {
        return addPlaylistToQueue(
          message,
          result.playlistInfo!.name,
          result.tracks,
        );
      }
      default:
        return message.reply(`Could not find any song with that name!`);
    }
  },
});