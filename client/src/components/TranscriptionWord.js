import React, { useState } from 'react';
import { Popover, OverlayTrigger } from 'react-bootstrap';
import { FiEdit3 } from 'react-icons/fi';
import { VscReplaceAll } from 'react-icons/vsc';
import { RiDeleteBinLine } from 'react-icons/ri';

import './transcriptionword.css';

function TranscriptionWord({
  word = {
    word: '',
    startTime: { seconds: '', nanos: '' },
    endTime: { seconds: '', nanos: '' },
  },
  progress,
  className,
  select,
  setShow,
  pIndex,
  wIndex,
}) {
  const [open, setOpen] = useState(false);

  const onSelectOption = (title, type, word, pIndex, wIndex) => {
    select({
      word,
      title,
      type,
      pIndex,
      wIndex,
    });
    setShow(true);
    setOpen(false);
  };

  const popover = (
    <Popover style={{ width: '250px' }}>
      <Popover.Header as='h3'>{word.word}</Popover.Header>
      <Popover.Body>
        <div>
          <p style={{ margin: 0, fontWeight: 'bolder' }}>Modify</p>
          <ul>
            <li>
              <pre
                className='text-info option-item'
                onClick={() => {
                  onSelectOption('Edit Text', 'editText', word, pIndex, wIndex);
                }}
              >
                Edit Text <FiEdit3 />
              </pre>
            </li>
            <li>
              <pre
                className='text-warning option-item'
                onClick={() => {
                  onSelectOption(
                    'Replace Text and Audio',
                    'replaceTextAudio',
                    word,
                    pIndex,
                    wIndex
                  );
                }}
              >
                Replace Text and Audio <VscReplaceAll />
              </pre>
            </li>
            <li>
              <pre
                className='text-success option-item'
                onClick={() => {
                  onSelectOption('Add new Word', 'addNewWord', pIndex, wIndex);
                }}
              >
                Add Word <VscReplaceAll />
              </pre>
            </li>
            <li>
              <pre
                className='text-danger option-item'
                onClick={() => {
                  onSelectOption(
                    'Delete Word',
                    'deleteWord',
                    word,
                    pIndex,
                    wIndex
                  );
                }}
              >
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
        rootClose
        show={open}
        onToggle={() => setOpen(false)}
        popperConfig={{
          modifiers: [
            { name: 'applyStyles', fn: () => {}, phase: 'read', enabled: true },
          ],
        }}
      >
        <div
          className={`word ${progress(word) && className}`}
          style={{
            cursor: 'pointer',
            margin: 0,
            padding: '5px',
            display: 'inline-flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: 'fit-content',
            height: '40px',
            backgroundColor: open
              ? '#1f9bcf'
              : null || progress(word)
              ? '#b5e4c5'
              : null,
            color: open ? 'white' : 'black',
          }}
          onClick={() => {
            setOpen(!open);
          }}
        >
          <div style={{ maxHeight: '75%' }}>
            <p style={{ userSelect: 'none' }}>{word.word}</p>
          </div>
          {/* <div>
            {progress && (
              <>
                {' '}
                <small>
                  {word.startTime.seconds && word.startTime.seconds}.
                  {word.startTime.nanos && word.startTime.nanos / 100000000}s
                </small>{' '}
                to{' '}
                <small>
                  {word.endTime.seconds && word.endTime.seconds}.
                  {word.endTime.nanos && word.endTime.nanos / 100000000}s
                </small>
              </>
            )}
          </div> */}
        </div>
      </OverlayTrigger>
    </>
  );
}

export default React.memo(TranscriptionWord);
