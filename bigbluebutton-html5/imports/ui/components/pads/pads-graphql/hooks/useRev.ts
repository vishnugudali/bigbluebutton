import { gql, useSubscription } from '@apollo/client';
import { useEffect, useState } from 'react';

interface GetPadLastRevResponse {
  sharedNotes: Array<{
    lastRev: number;
  }>;
}

const GET_PAD_LAST_REV = gql`
  subscription GetPadLastRev($externalId: String!) {
    sharedNotes(
      where: { sharedNotesExtId: { _eq: $externalId } }
    ) {
      lastRev
    }
  }
`;

const useRev = (externalId: string) => {
  const [rev, setRev] = useState(0);
  const { data: padRevData } = useSubscription<GetPadLastRevResponse>(
    GET_PAD_LAST_REV,
    { variables: { externalId } },
  );

  useEffect(() => {
    if (!padRevData) return;
    const pad = padRevData.sharedNotes[0];
    if (!pad) return;
    setRev(pad.lastRev);
  }, [padRevData]);

  return rev;
};

export default useRev;
