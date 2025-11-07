'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  Spinner,
} from '@chakra-ui/react'
import { FaSearch } from 'react-icons/fa'
import { toaster } from '@/components/ui/toaster'
import type { Organization, Repository, RepositoryInfo } from '@/types'

interface RepositorySelectorProps {
  onSelectRepository: (repoInfo: RepositoryInfo) => void
}

export default function RepositorySelector({
  onSelectRepository,
}: RepositorySelectorProps) {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null)
  const [repositories, setRepositories] = useState<Repository[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingOrgs, setLoadingOrgs] = useState(true)

  // Load organizations on mount
  useEffect(() => {
    fetchOrganizations()
  }, [])

  // Load repositories when org changes
  useEffect(() => {
    if (selectedOrg) {
      fetchRepositories(selectedOrg.login)
    }
  }, [selectedOrg])

  const fetchOrganizations = async () => {
    try {
      setLoadingOrgs(true)
      const response = await fetch('/api/repos/organizations')
      if (!response.ok) throw new Error('Failed to fetch organizations')
      const data: Organization[] = await response.json()
      setOrganizations(data)
      // Auto-select user (first item)
      if (data.length > 0) {
        setSelectedOrg(data[0])
      }
    } catch (error) {
      console.error('Error fetching organizations:', error)
      toaster.create({
        title: 'Error',
        description: 'Failed to load organizations',
        type: 'error',
      })
    } finally {
      setLoadingOrgs(false)
    }
  }

  const fetchRepositories = async (owner: string, search = '') => {
    try {
      setLoading(true)
      const params = new URLSearchParams({ owner })
      if (search) params.append('search', search)

      const response = await fetch(`/api/repos/list?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch repositories')
      const data: Repository[] = await response.json()
      setRepositories(data)
    } catch (error) {
      console.error('Error fetching repositories:', error)
      toaster.create({
        title: 'Error',
        description: 'Failed to load repositories',
        type: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    if (selectedOrg) {
      fetchRepositories(selectedOrg.login, searchQuery)
    }
  }

  const handleSelectRepo = (repo: Repository) => {
    onSelectRepository({
      owner: repo.owner,
      repo: repo.name,
      fullName: repo.fullName,
      defaultBranch: repo.defaultBranch,
    })
  }

  if (loadingOrgs) {
    return (
      <Box textAlign='center' py={8}>
        <Spinner size='lg' color='yellow.400' />
        <Text mt={4} color='gray.400'>
          Loading organizations...
        </Text>
      </Box>
    )
  }

  return (
    <VStack width='full' gap={4} alignItems='stretch'>
      {/* Organization Selector */}
      <Box>
        <Text fontSize='sm' fontWeight='medium' color='gray.300' mb={2}>
          Select Organization or User
        </Text>
        <HStack flexWrap='wrap' gap={2}>
          {organizations.map((org) => (
            <Button
              key={org.id}
              size='sm'
              variant={selectedOrg?.id === org.id ? 'solid' : 'outline'}
              colorPalette={selectedOrg?.id === org.id ? 'yellow' : 'gray'}
              onClick={() => setSelectedOrg(org)}
            >
              {org.isUser ? '👤 ' : '🏢 '}
              {org.name}
            </Button>
          ))}
        </HStack>
      </Box>

      {/* Repository Search */}
      {selectedOrg && (
        <>
          <Box>
            <Text fontSize='sm' fontWeight='medium' color='gray.300' mb={2}>
              Search Repository
            </Text>
            <HStack>
              <Input
                placeholder='Search repositories...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                bgColor='gray.800'
                borderColor='gray.600'
                color='white'
                _placeholder={{ color: 'gray.500' }}
              />
              <Button
                onClick={handleSearch}
                colorPalette='yellow'
                disabled={loading}
              >
                <FaSearch />
                Search
              </Button>
            </HStack>
          </Box>

          {/* Repository List */}
          <Box>
            <Text fontSize='sm' fontWeight='medium' color='gray.300' mb={2}>
              Select Repository {loading && <Spinner size='sm' ml={2} />}
            </Text>
            <VStack
              maxH='300px'
              overflowY='auto'
              gap={2}
              alignItems='stretch'
              bgColor='gray.800'
              borderRadius='md'
              p={2}
            >
              {repositories.length === 0 && !loading && (
                <Text color='gray.500' textAlign='center' py={4}>
                  No repositories found
                </Text>
              )}
              {repositories.map((repo) => (
                <Box
                  key={repo.id}
                  p={3}
                  bgColor='gray.700'
                  borderRadius='md'
                  cursor='pointer'
                  _hover={{ bgColor: 'gray.600' }}
                  onClick={() => handleSelectRepo(repo)}
                >
                  <HStack justifyContent='space-between'>
                    <VStack alignItems='flex-start' gap={1}>
                      <Text fontWeight='medium' color='white'>
                        {repo.name}
                      </Text>
                      {repo.description && (
                        <Text fontSize='xs' color='gray.400' truncate>
                          {repo.description}
                        </Text>
                      )}
                    </VStack>
                    {repo.isPrivate && (
                      <Text fontSize='xs' color='yellow.400'>
                        🔒 Private
                      </Text>
                    )}
                  </HStack>
                </Box>
              ))}
            </VStack>
          </Box>
        </>
      )}
    </VStack>
  )
}
