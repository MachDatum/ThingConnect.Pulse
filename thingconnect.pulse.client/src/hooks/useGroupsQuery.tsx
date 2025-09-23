import type { Group } from '@/api/types';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export const useGroupsQuery = () => {
  return useQuery<Group[], Error>({
    queryKey: ['groups'],
    queryFn: async () => {
      const response = await axios.get('/api/groups');
      return response.data;
    },
  });
};
