import React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
function OverlayToolTip({
  placement = 'bottom',
  delay = { show: 250, hide: 250 },
  children,
  content = '',
}) {
  const renderTooltip = (props) => (
    <Tooltip id='tooltip' {...props}>
      {content}
    </Tooltip>
  );
  return (
    <OverlayTrigger placement={placement} delay={delay} overlay={renderTooltip}>
      {children}
    </OverlayTrigger>
  );
}

export default OverlayToolTip;
