import React, { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useQuery, useSubscription } from '@apollo/client';
import BBBMenu from '/imports/ui/components/common/menu/component';
import Trigger from '/imports/ui/components/common/control-header/right/component';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import NotesService from '/imports/ui/components/notes/service';
import { uniqueId } from '/imports/utils/string-utils';
import { layoutSelect } from '/imports/ui/components/layout/context';
import { PROCESSED_PRESENTATIONS_SUBSCRIPTION } from '/imports/ui/components/whiteboard/queries';
import Service from './service';
import { GET_PAD_ID, GetPadIdQueryResponse } from './queries';

const DEBOUNCE_TIMEOUT = 15000;
const NOTES_CONFIG = window.meetingClientSettings.public.notes;
const NOTES_IS_PINNABLE = NOTES_CONFIG.pinnable;

const intlMessages = defineMessages({
  convertAndUploadLabel: {
    id: 'app.notes.notesDropdown.covertAndUpload',
    description: 'Export shared notes as a PDF and upload to the main room',
  },
  pinNotes: {
    id: 'app.notes.notesDropdown.pinNotes',
    description: 'Label for pin shared notes button',
  },
  options: {
    id: 'app.notes.notesDropdown.notesOptions',
    description: 'Label for shared notes options',
  },
});

interface NotesDropdownContainerGraphqlProps {
  handlePinSharedNotes: (pinned: boolean) => void
}

interface NotesDropdownGraphqlProps extends NotesDropdownContainerGraphqlProps {
  amIPresenter: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  presentations: any;
  isRTL: boolean;
  padId: string;
}

const NotesDropdownGraphql: React.FC<NotesDropdownGraphqlProps> = (props) => {
  const {
    amIPresenter, presentations, handlePinSharedNotes, isRTL, padId,
  } = props;
  const [converterButtonDisabled, setConverterButtonDisabled] = useState(false);
  const intl = useIntl();

  const getAvailableActions = () => {
    const uploadIcon = 'upload';
    const pinIcon = 'presentation';

    const menuItems = [];

    if (amIPresenter) {
      menuItems.push(
        {
          key: uniqueId('notes-option-'),
          icon: uploadIcon,
          dataTest: 'moveNotesToWhiteboard',
          label: intl.formatMessage(intlMessages.convertAndUploadLabel),
          disabled: converterButtonDisabled,
          onClick: () => {
            setConverterButtonDisabled(true);
            setTimeout(() => setConverterButtonDisabled(false), DEBOUNCE_TIMEOUT);
            return Service.convertAndUpload(presentations, padId);
          },
        },
      );
    }

    if (amIPresenter && NOTES_IS_PINNABLE) {
      menuItems.push(
        {
          key: uniqueId('notes-option-'),
          icon: pinIcon,
          dataTest: 'pinNotes',
          label: intl.formatMessage(intlMessages.pinNotes),
          onClick: () => {
            handlePinSharedNotes(true);
          },
        },
      );
    }

    return menuItems;
  };

  const actions = getAvailableActions();

  if (actions.length === 0) return null;

  return (
    <>
      <BBBMenu
        trigger={(
          <Trigger
            data-test="notesOptionsMenu"
            icon="more"
            label={intl.formatMessage(intlMessages.options)}
            aria-label={intl.formatMessage(intlMessages.options)}
            onClick={() => null}
          />
          )}
        opts={{
          id: 'notes-options-dropdown',
          keepMounted: true,
          transitionDuration: 0,
          elevation: 3,
          getcontentanchorel: null,
          fullwidth: 'true',
          anchorOrigin: { vertical: 'bottom', horizontal: isRTL ? 'right' : 'left' },
          transformOrigin: { vertical: 'top', horizontal: isRTL ? 'right' : 'left' },
        }}
        actions={actions}
      />
    </>
  );
};

const NotesDropdownContainerGraphql: React.FC<NotesDropdownContainerGraphqlProps> = (props) => {
  const { handlePinSharedNotes } = props;
  const { data: currentUserData } = useCurrentUser((user) => ({
    presenter: user.presenter,
  }));
  const amIPresenter = !!currentUserData?.presenter;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isRTL = layoutSelect((i: any) => i.isRTL);

  const { data: presentationData } = useSubscription(PROCESSED_PRESENTATIONS_SUBSCRIPTION);
  const presentations = presentationData?.pres_presentation || [];

  const { data: padIdData } = useQuery<GetPadIdQueryResponse>(
    GET_PAD_ID,
    { variables: { externalId: NotesService.ID } },
  );
  const padId = padIdData?.sharedNotes?.[0]?.padId;

  if (!padId) return null;

  return (
    <NotesDropdownGraphql
      amIPresenter={amIPresenter}
      isRTL={isRTL}
      presentations={presentations}
      handlePinSharedNotes={handlePinSharedNotes}
      padId={padId}
    />
  );
};

export default NotesDropdownContainerGraphql;
