import { botCache } from "../../deps.ts";
import { PermissionLevels } from "../types/commands.ts";
import { createSubcommand, createCommand, getCurrentLanguage } from "../utils/helpers.ts";
import { Embed } from "../utils/Embed.ts";
import { db } from "../database/database.ts";

const allowedLanguages = [ { id: "en_US", flag: ":flag_us:", name: "English"}, { id: "cs_CZ", flag:":flag_cz:", name: "Czech"}];

createCommand({
  name: "language",
  aliases: ['lang'],
  arguments: [
    {
      name: "subcommand",
      type: "subcommand",
      required: false,
    },
  ],
  guildOnly: true,
  permissionLevels: [PermissionLevels.MEMBER],
  execute: async function (message) {
    //@ts-ignore
    const currentLanguageId = getCurrentLanguage(message.guildID, message.guild.preferredLocale);
    let currentLanguage = allowedLanguages.find(item => item.id === currentLanguageId) || allowedLanguages[0];
    const embed = new Embed()
      .setTitle("Language Information")
      .setDescription(`**Current Language**: ${currentLanguage.flag} - \`${currentLanguage.name}\``)
      .setTimestamp();

    await message.send({ embed }).catch(console.log);
  },
});

createSubcommand("language", {
  name: "set",
  arguments: [
    {
      name: "language",
      type: "string",
      required: true,
      missing: async function(message) {
        const listOfLanguages = allowedLanguages.map(lang => `${lang.flag} - \`${lang.name}\``).join('\n');
        const embed = new Embed()
          .setTitle("Available Languages")
          .setDescription(listOfLanguages);
        await message.send({ embed}).catch(console.log);
      },
    },
  ],
  permissionLevels: [PermissionLevels.ADMIN],
  execute: async function (message, args) {
    //Old
    //@ts-ignore
    const oldLanguageId = getCurrentLanguage(message.guildID, message.guild.preferredLocale);
    const oldLanguage = allowedLanguages.find(item => item.id === oldLanguageId) || allowedLanguages[0];

    //New
    const newLanguageName = args.language;
    const newLanguage = allowedLanguages.find(item => item.name === newLanguageName);

    //Handle
    if (!newLanguage) {
      const embed = new Embed()
        .setTitle("Error")
        .setDescription('Check list of languages by running command `language set`.')
        .addField('Error', `\`${args.language}\` is not a valid language`);

        await message.send({ embed }).catch(console.log);
    } else if(newLanguage.id === oldLanguageId) {
      const embed = new Embed()
        .setTitle("Error")
        .setDescription('Check list of languages by running command `language set`.')
        .addField('Error', `\`${args.language}\` is already set.`);

        await message.send({ embed }).catch(console.log);
    }
    else {
      botCache.guildLanguages.set(message.guildID, newLanguage.id);
      await db.guilds.update(message.guildID, { language: newLanguage.id });

      const embed = new Embed()
        .setTitle("Success")
        .setDescription([`**Old Language**: ${oldLanguage.flag} - \`${oldLanguage.name}\``, `**New Language**: ${newLanguage.flag} - \`${newLanguage.name}\``])
        .setTimestamp();

      await message.send({ embed }).catch(console.log);
    }
  },
});