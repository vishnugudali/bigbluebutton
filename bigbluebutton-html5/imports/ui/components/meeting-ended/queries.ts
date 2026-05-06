import { gql } from '@apollo/client';

export interface MeetingEndDataResponse {
  user_current: Array<{
    meeting: {
      learningDashboard: {
        learningDashboardAccessToken: string;
      }
    };
    userMetadata: Array<{
      parameter: string;
      value: string;
    }>;
  }>;
}

export const getMeetingEndData = gql`
query getMeetingEndData {
  user_current {
    meeting {
      learningDashboard {
        learningDashboardAccessToken
      }
    }
    userMetadata {
      parameter
      value
    }
  }
}
`;

export default {
  getMeetingEndData,
};
