import React, { useState, useRef } from 'react';
import { Popover, OverlayTrigger } from 'react-bootstrap';
import { FiEdit3 } from 'react-icons/fi';
import { VscReplaceAll } from 'react-icons/vsc';
import { RiDeleteBinLine } from 'react-icons/ri';

import './transcriptionword.css';

function TranscriptionWord({
  word = { word: '', startTime: {}, endTime: {} },
  playbackTime,
}) {
  const [open, setOpen] = useState(false);
  const wordRef = useRef();
  const popover = (
    <Popover style={{ width: '250px' }}>
      <Popover.Header as='h3'>{word.word}</Popover.Header>
      <Popover.Body>
        <div>
          <p style={{ margin: 0, fontWeight: 'bolder' }}>Modify</p>
          <ul>
            <li>
              <pre className='text-info option-item'>
                Edit Text <FiEdit3 />
              </pre>
            </li>
            <li>
              <pre className='text-info option-item'>
                Edit Text and Audio <FiEdit3 />
              </pre>
            </li>
            <li>
              <pre className='text-warning option-item'>
                Replace <VscReplaceAll />
              </pre>
            </li>
            <li>
              <pre className='text-danger option-item'>
                Delete <RiDeleteBinLine />
              </pre>
            </li>
          </ul>
        </div>
        <hr />
        <div>
          <p style={{ margin: 0, fontWeight: 'bolder' }}>Duration</p>
          <small>
            {word.startTime.seconds && word.startTime.seconds}.
            {word.startTime.nanos && word.startTime.nanos / 100000000}s
          </small>{' '}
          to{' '}
          <small>
            {word.endTime.seconds && word.endTime.seconds}.
            {word.endTime.nanos && word.endTime.nanos / 100000000}s
          </small>
        </div>
      </Popover.Body>
    </Popover>
  );

  return (
    <>
      <OverlayTrigger
        trigger='click'
        placement='top'
        overlay={popover}
        onEnter={() => setOpen(true)}
        onExit={() => setOpen(false)}
        rootClose
      >
        <div
          style={{
            cursor: 'pointer',
            margin: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: 'fit-content',
            backgroundColor: open ? '#d2ebf5' : null,
            height: '40px',
          }}
          className='border'
          ref={wordRef}
        >
          <div style={{ maxHeight: '50%' }}>
            <p style={{ userSelect: 'none' }}>{word.word}</p>
          </div>
        </div>
      </OverlayTrigger>
    </>
  );
}

export default TranscriptionWord;
