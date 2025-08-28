import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

export function setupServerTools(server: McpServer) {
  // Get current time tool
  server.tool(
    'get_time',
    'Get the current date and time in various formats',
    {
      timezone: z.string().optional().describe('The timezone to display the time in (e.g., "America/New_York", "Europe/London", "UTC"). Defaults to system local timezone if not specified.'),
      format: z.enum(['iso', 'local', 'unix', 'human']).optional().describe('The format to return the time in: iso (ISO 8601), local (locale string), unix (timestamp), human (readable format). Defaults to "iso".')
    },
    async ({ timezone, format }: { timezone?: string; format?: 'iso' | 'local' | 'unix' | 'human' }) => {
      const now = new Date();
      const tz = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
      const fmt = format || 'iso';
      
      let timeString: string;
      let timestamp: number;
      
      try {
        timestamp = now.getTime();
        
        switch (fmt) {
          case 'iso':
            if (tz === 'UTC') {
              timeString = now.toISOString();
            } else {
              // For local/other timezones, show local ISO format without Z suffix
              const localIso = now.toLocaleString('sv-SE', { timeZone: tz }).replace(' ', 'T');
              timeString = localIso;
            }
            break;
          case 'local':
            timeString = timezone 
              ? now.toLocaleString('en-US', { timeZone: timezone })
              : now.toLocaleString();
            break;
          case 'unix':
            timeString = Math.floor(timestamp / 1000).toString();
            break;
          case 'human':
            timeString = timezone
              ? now.toLocaleString('en-US', { 
                  timeZone: timezone,
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  timeZoneName: 'short'
                })
              : now.toLocaleString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  timeZoneName: 'short'
                });
            break;
          default:
            timeString = now.toISOString();
        }
        
        return {
          content: [
            {
              type: "text",
              text: `Current time (${tz}, ${fmt} format): ${timeString}`
            }
          ],
          time: {
            timezone: tz,
            format: fmt,
            value: timeString,
            unix_timestamp: Math.floor(timestamp / 1000),
            iso_string: now.toISOString()
          }
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error getting time: ${error instanceof Error ? error.message : 'Unknown error'}`
            }
          ],
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }
  );

  //TODO: Setup additional tools
  // server.tool(
  //   'create_todo',
  //   'Create a new todo item',
  //   {
  //     title: z.string().describe('The title of the todo'),
  //     description: z.string().describe('The description of the todo'),
  //     status: z.enum([TodoStatus.NOT_STARTED, TodoStatus.IN_PROGRESS, TodoStatus.COMPLETED, TodoStatus.CANCELED]).optional().describe('The status of the todo'),
  //     due_date: z.string().optional().describe('The due date of the todo'),
  //   },       
  //   async ({ title, description, status, due_date }: { 
  //     title: string; 
  //     description: string; 
  //     status?: TodoStatus; 
  //     due_date?: string; 
  //   }) => {
  //     const now = new Date().toISOString();
  //     const todo: Todo = {
  //       id: crypto.randomUUID(),
  //       title,
  //       description,
  //       status: status || TodoStatus.NOT_STARTED,
  //       due_date,
  //       created_at: now,
  //       updated_at: now
  //     };
  //     console.log("Result: ", todo);
  //    
  //       return {
  //         content: [
  //           {
  //             type: "text",
  //             text: `Todo created with id: ${todo.id}`
  //           }
  //         ],
  //         todo
  //       };
  //   }
  // );
} 