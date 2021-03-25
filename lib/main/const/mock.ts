export const MOCK_REWARDS_RESPONSE = {
  data: [
    {
      broadcaster_name: 'torpedo09',
      broadcaster_login: 'torpedo09',
      broadcaster_id: '274637212',
      id: '92af127c-7326-4483-a52b-b0da0be61c01',
      image: null,
      background_color: '#00E5CB',
      is_enabled: true,
      cost: 50000,
      title: 'game analysis',
      prompt: '',
      is_user_input_required: false,
      max_per_stream_setting: {
        is_enabled: false,
        max_per_stream: 0,
      },
      max_per_user_per_stream_setting: {
        is_enabled: false,
        max_per_user_per_stream: 0,
      },
      global_cooldown_setting: {
        is_enabled: false,
        global_cooldown_seconds: 0,
      },
      is_paused: false,
      is_in_stock: true,
      default_image: {
        url_1x:
          'https://static-cdn.jtvnw.net/custom-reward-images/default-1.png',
        url_2x:
          'https://static-cdn.jtvnw.net/custom-reward-images/default-2.png',
        url_4x:
          'https://static-cdn.jtvnw.net/custom-reward-images/default-4.png',
      },
      should_redemptions_skip_request_queue: false,
      redemptions_redeemed_current_stream: null,
      cooldown_expires_at: null,
    },
  ],
}

export const MOCK_REDEMPTIONS_RESPONSE = {
  data: [
    {
      broadcaster_name: 'torpedo09',
      broadcaster_login: 'torpedo09',
      broadcaster_id: '274637212',
      id: '17fa2df1-ad76-4804-bfa5-a40ef63efe63',
      user_login: 'torpedo09',
      user_id: '274637212',
      user_name: 'torpedo09',
      user_input: '',
      status: 'CANCELED',
      redeemed_at: '2020-07-01T18:37:32Z',
      reward: {
        id: '92af127c-7326-4483-a52b-b0da0be61c01',
        title: 'game analysis',
        prompt: '',
        cost: 50000,
      },
    },
  ],
  pagination: {
    cursor:
      'eyJiIjpudWxsLCJhIjp7IkN1cnNvciI6Ik1UZG1ZVEprWmpFdFlXUTNOaTAwT0RBMExXSm1ZVFV0WVRRd1pXWTJNMlZtWlRZelgxOHlNREl3TFRBM0xUQXhWREU0T2pNM09qTXlMakl6TXpFeU56RTFOMW89In19',
  },
}

export const MOCK_REDEMPTIONS_RESPONSE_BY_ID = {
  data: [
    {
      broadcaster_name: 'torpedo09',
      broadcaster_login: 'torpedo09',
      broadcaster_id: '274637212',
      id: '17fa2df1-ad76-4804-bfa5-a40ef63efe63',
      user_id: '274637212',
      user_name: 'torpedo09',
      user_input: '',
      status: 'CANCELED',
      redeemed_at: '2020-07-01T18:37:32Z',
      reward: {
        id: '92af127c-7326-4483-a52b-b0da0be61c01',
        title: 'game analysis',
        prompt: '',
        cost: 50000,
      },
    },
  ],
}
