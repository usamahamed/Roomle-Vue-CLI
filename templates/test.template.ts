import {{ COMPONENT_NAME }} from '{{ RELATIVE_COMPONENT_PATH }}';
import { mount } from '@vue/test-utils';
import { setupInjects } from '@/../tests/helpers/utils';
import { LocalizeMock } from '@/../tests/helpers/mocks/localize';
import { getStoreMock } from '@/../tests/helpers/mocks/store';
import { MockSdkConnector } from '@/../tests/helpers/mocks/sdk-connector';
import {
  COLLECTION_VIEW_TYPES,
  getInitialCollectionViewState,
} from '@/common/store/collection-view-state';

describe('{{ COMPONENT_NAME }}', () => {
    let mockSdkConnector: MockSdkConnector;
    beforeEach(() => {
      mockSdkConnector = new MockSdkConnector();
    });
  
    const factory = (propsData: object = {}) => {
      const mockStore = getStoreMock({
        uiState: {
          state: {
            initData: {
              locale: 'en',
            },
          },
        },
      });
      const $sdkConnector = new MockSdkConnector({
        store: mockStore.$store,
      });
      setupInjects([
        { name: '$sdkConnector', instance: $sdkConnector },
        {
          name: '$store',
          instance: mockStore.$store,
          onInstance: true,
        },
      ]);    
      return mount(
        {{ COMPONENT_NAME }} as any /* -- vite refactor remove as any later, probably upgrade to Vue3 needed */,
        {
          propsData: {
            onExpand: jest.fn(),
            onCollapse: jest.fn(),
            isDesktop: false,
            state: getInitialCollectionViewState(COLLECTION_VIEW_TYPES.UNIT_TEST),
            ...propsData,
          },
          mocks: {
            ...LocalizeMock,
            ...mockStore,
            $sdkConnector: mockSdkConnector,
          },
        }
        );  
    };
  it('renders properly', () => {
    const wrapper = factory();
    expect(wrapper.exists()).toBe(true);
  });

  // Write your component tests here
});
