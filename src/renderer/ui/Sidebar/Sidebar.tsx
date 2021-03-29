import { shell } from 'electron'
import * as React from 'react'
import Button from 'react-bootstrap/Button'
import ListGroup from 'react-bootstrap/ListGroup'

import './Sidebar.scss'

const Sidebar = ({ selectedReward, user, rewards, selectReward }) => {
  return (
    <div className="f390 d-flex flex-column border-end">
      <ListGroup className="flex-fill border-bottom" variant="flush">
        {rewards &&
          rewards.map((reward) => {
            const { id, backgroundColor, image, defaultImage } = reward
            const iconSrc = image?.url_2x || defaultImage.url_2x

            return (
              <ListGroup.Item
                key={id}
                action
                active={selectedReward === reward.id}
                className="reward d-flex align-items-center"
                onClick={() => selectReward(id)}
              >
                <div
                  className="icon"
                  style={{
                    backgroundColor,
                    backgroundImage: `url(${iconSrc})`,
                  }}
                />
                <div className="flex-fill">{reward.title}</div>
              </ListGroup.Item>
            )
          })}
      </ListGroup>
      {user && (
        <div className="d-flex align-items-center justify-content-center p-2">
          <Button
            className="manage-button rounded-pill"
            onClick={() => openViewerRewardsDashboard(user)}
          >
            Manage rewards
            <i className="bi bi-box-arrow-up-right ms-2"></i>
          </Button>
        </div>
      )}
    </div>
  )
}

const openViewerRewardsDashboard = (user) => {
  const { name, displayName } = user
  shell.openExternal(
    `https://dashboard.twitch.tv/u/${
      name || displayName
    }/viewer-rewards/channel-points/rewards`
  )
}

export default Sidebar
