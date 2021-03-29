# Twitch Channel Point Macros 🚀

![Interfaces](https://i.imgur.com/tgpd7tz.png)

TCPM (Twitch Channel Point Macros) is a macro program that integrates with channel point rewards. You can set it up to trigger keys/hotkeys or your own scripts when a reward is redeemed! TCPM is conceptually similar to [LioranBoard](https://christinna9031.github.io/LBDocumentation/) but is cross-platform, is more streamlined, and doesn't require setting up a stream deck.

For more details, examples, and screenies, please check out the [Devpost entry.](https://devpost.com/software/channel-points-controller)


## Development

1. Complete the following variables and add to an `.env` file in the root directory:
```
TWITCH_CLIENT_ID=foo
TWITCH_SECRET=bar
```
If you do not provide these variables, the app will not be able to communicate with the Twitch API.

2. Run `yarn`.
3. In two separate terminals, run `yarn watch` and `yarn start`. The former watches for file changes and re-builds. The latter starts the running instance of the app.

## Package and distribute

_As of Mar 29, 2021, this project is **not** ready for production usage even though the app works in a packaged state._

```
yarn make
```

## Privacy and other disclaimers
As of Mar 29, 2021,
1. The app does **not** send data anywhere except back-and-forth with Twitch. All your data are belong to you.
2. This project and its creators are **not** affiliated with any of the platforms and applications detailed above, including Twitch.
