import React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

const popperConfig = {
  modifiers: [
    { name: 'applyStyles', fn: () => {}, phase: 'read', enabled: true },
  ],
};

function OverlayToolTip({
  placement = 'bottom',
  delay = { show: 1000, hide: 250 },
  children,
  content = '',
}) {
  const renderTooltip = (props) => (
    <Tooltip id='tooltip' {...props}>
      {content}
    </Tooltip>
  );
  return (
    <OverlayTrigger
      placement={placement}
      delay={delay}
      overlay={renderTooltip}
      popperConfig={popperConfig}
    >
      {children}
    </OverlayTrigger>
  );
}

export default OverlayToolTip;
