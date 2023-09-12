import { makeCall } from '/imports/ui/services/api';
import Polls from '/imports/api/polls';
import { debounce } from 'lodash';
import cnxAvalonUtils from '/imports/utils/cnxAvalonUtils';

const MAX_CHAR_LENGTH = 5;

const handleVote = (pollId, answerIds) => {
  makeCall('publishVote', pollId, answerIds);
};

const handleTypedVote = (pollId, answer) => { 
  const maskedAnswer=cnxAvalonUtils.handleMasking('',answer)
  makeCall('publishTypedVote', pollId, maskedAnswer);
};

const mapPolls = () => {
  const poll = Polls.findOne({});
  if (!poll) {
    return { pollExists: false };
  }

  const { answers } = poll;
  let stackOptions = false;

  answers.map((obj) => {
    if (stackOptions) return obj;
    if (obj.key && obj.key.length > MAX_CHAR_LENGTH) {
      stackOptions = true;
    }
    return obj;
  });

  const amIRequester = poll.requester !== 'userId';

  return {
    poll: {
      answers: poll.answers,
      pollId: poll.id,
      isMultipleResponse: poll.isMultipleResponse,
      pollType: poll.pollType,
      stackOptions,
      question: poll.question,
      secretPoll: poll.secretPoll,
    },
    pollExists: true,
    amIRequester,
    handleVote: debounce(handleVote, 500, { leading: true, trailing: false }),
    handleTypedVote: debounce(handleTypedVote, 500, { leading: true, trailing: false }),
  };
};

export default { mapPolls };
